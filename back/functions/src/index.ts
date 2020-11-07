import admin = require('firebase-admin');
import * as functions from 'firebase-functions';

admin.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const vstsHook = functions.https.onRequest(async (request, response) => {
  const projectId = request.query.projectId as string;

  if (!projectId) {
    response.send("Unable to read project id");
    return;
  }

  const body = request.body;
  const event = body.eventType;

  let handler = null;
  switch (event) {
    case 'git.pullrequest.created':
      handler = handlePullRequest.bind(null, projectId, {
        action: 'opened',
        pull_request: {
          id: body.resource.pullRequestId,
          created_at: body.resource.creationDate,
          user: {
            login: body.resource.createdBy.uniqueName
          }
        }
      });
      break;
    case 'git.pullrequest.updated':
      const message = body.message.text as string;
      let votedIndex = -1;
      votedIndex = message.indexOf('has approved');
      if (votedIndex < 0) votedIndex = message.indexOf('approved');
      if (votedIndex < 0) votedIndex = message.indexOf('is waiting for the author');
      if (votedIndex < 0) votedIndex = message.indexOf('rejected');

      if (votedIndex < 0) {
        response.send(`Cannot parse message: ${message}`);
        return;
      }

      const reviewerName = message.substring(0, votedIndex).trim();
      const reviewerObject = body.resource.reviewers.find((reviewer: any) => reviewer.displayName === reviewerName);

      handler = handlePullRequestReview.bind(null, projectId, {
        action: 'submitted',
        pull_request: {
          id: body.resource.pullRequestId
        },
        review: {
          id: body.resource.pullRequestId + '_' + reviewerObject.uniqueName,
          user: {
            login: reviewerObject.uniqueName
          }
        }
      });
      break;
    case 'ms.vss-code.git-pullrequest-comment-event':
      const comment = body.resource.comment; 
      const threadLink = comment._links.threads.href as string;
      const threadId = threadLink.substring(threadLink.lastIndexOf('/') + 1);

      handler = handlePullRequestReviewComment.bind(null, projectId, {
        action: 'created',
        pull_request: {
          id: body.resource.pullRequest.pullRequestId
        },
        comment: {
          id: threadId + '_' + comment.id,
          user: {
            login: comment.author.uniqueName
          }
        }
      });
  }

  if (!handler) {
    response.send(`Did not found handler for ${event} event.`);
    return;
  }

  functions.logger.info(request.body);
  const result = await handler();

  response.send(`Successfully handled ${event} event. Result: ${result}`);
});

export const githubHook = functions.https.onRequest(async (request, response) => {
  const projectId = request.query.projectId as string;

  if (!projectId) {
    response.send("Unable to read project id");
    return;
  }

  const event = request.get('X-GitHub-Event');

  let handler = null;
  switch (event) {
    case 'pull_request':
      handler = handlePullRequest;
      break;
    case 'pull_request_review':
      handler = handlePullRequestReview;
      break;
    case 'pull_request_review_comment':
      handler = handlePullRequestReviewComment;
      break;
  }

  if (!handler) {
    response.send(`Did not found handler for ${event} event.`);
    return;
  }

  functions.logger.info(request.body);
  const result = await handler(projectId, request.body);

  response.send(`Successfully handled ${event} event. Result: ${result}`);
});

const handlePullRequest = async (projectId: string, body: {action: string, pull_request: {id: string, created_at: string, user: {login: string}}}): Promise<string> => {
  if (body.action !== 'opened') {
    return `Skip ${body.action} action`;
  }

  const pr = body.pull_request;
  const existingPr = await admin.firestore().collection(`projects/${projectId}/pull_requests`).where('id', '==', pr.id).get();
  if (!existingPr.empty) {
    return `PR ${pr.id} already exists in project ${projectId}`;
  }

  const creator = await getCreator(projectId, pr.user.login);

  if (creator.status === 'Error') {
    return creator.message;
  }

  await admin.firestore().collection(`projects/${projectId}/pull_requests`).add({
    id: pr.id,
    creator: creator.message,
    createdAt: pr.created_at,
    reviews: [],
    comments: []
  });

  return `Create a new PR with id: ${pr.id}`;
}

const handlePullRequestReview = async (projectId: string, body: {action:string, pull_request:{id:string}, review:{id:string, user:{login:string}}}): Promise<string> => {
  if (body.action !== 'submitted') {
    return `Skip ${body.action} action`;
  }

  const pr = body.pull_request;

  const existingPrQuery = await admin.firestore().collection(`projects/${projectId}/pull_requests`).where('id', '==', pr.id).get();
  if (existingPrQuery.empty) {
    return `PR ${pr.id} is not tracked in project ${projectId}`;
  }

  const existingPrDoc = existingPrQuery.docs[0];
  
  const review = body.review;
  if (existingPrDoc.data().reviews?.find((reviewInPr: any) => reviewInPr.id === review.id)) {
    return `Review ${review.id} for PR ${pr.id} already exists in project ${projectId}`;
  }

  const creator = await getCreator(projectId, review.user.login);

  if (creator.status === 'Error') {
    return creator.message;
  }

  await admin.firestore().doc(`projects/${projectId}/pull_requests/${existingPrDoc.id}`).update({
    reviews: admin.firestore.FieldValue.arrayUnion({
      id: review.id,
      creator: creator.message
    })
  });

  return `Create a new review with id ${review.id} in PR with id ${pr.id}`;
}

const handlePullRequestReviewComment = async (projectId: string, body: {action:string, pull_request:{id:string},comment:{id:string, user:{login:string}}}): Promise<string> => {
  if (body.action !== 'created') {
    return `Skip ${body.action} action`;
  }

  const pr = body.pull_request;

  const existingPrQuery = await admin.firestore().collection(`projects/${projectId}/pull_requests`).where('id', '==', pr.id).get();
  if (existingPrQuery.empty) {
    return `PR ${pr.id} is not tracked in project ${projectId}`;
  }

  const existingPrDoc = existingPrQuery.docs[0];
  
  const comment = body.comment;
  if (existingPrDoc.data().comments?.find((commentInPr: any) => commentInPr.id === comment.id)) {
    return `Review ${comment.id} for PR ${pr.id} already exists in project ${projectId}`;
  }

  const creator = await getCreator(projectId, comment.user.login);

  if (creator.status === 'Error') {
    return creator.message;
  }

  await admin.firestore().doc(`projects/${projectId}/pull_requests/${existingPrDoc.id}`).update({
    comments: admin.firestore.FieldValue.arrayUnion({
      id: comment.id,
      creator: creator.message
    })
  });

  return `Create a new comment with id ${comment.id} in PR with id ${pr.id}`;
}

const getCreator = async (projectId: string, userLogin: string): Promise<{status: ('Error' | 'Success'), message: string}> => {
  const project = await admin.firestore().doc(`projects/${projectId}`).get();
  const projectData = project.data();

  if (!projectData) {
    return {
      status: 'Error',
      message: `Project ${projectId} does not exists`
    };
  }

  const mappings = projectData.mappings;
  const creatorEmail = mappings?.find((mapping: any) => mapping.mappedName === userLogin)?.reviewerEmail;
  const creator = creatorEmail ?? userLogin;

  return {
    status: 'Success',
    message: creator
  };
}