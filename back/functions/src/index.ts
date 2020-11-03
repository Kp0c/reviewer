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
  }

  if (!handler) {
    response.send(`Did not found handler for ${event} event.`);
    return;
  }

  functions.logger.info(request.body);
  const result = await handler(projectId, request.body);

  response.send(`Successfully handled ${event} event. Result: ${result}`);
});

const handlePullRequest = async (projectId: string, body: any): Promise<string> => {
  if (body.action !== 'opened') {
    return `Skip ${body.action} action`;
  }

  const pr = body.pull_request;
  const existingPr = await admin.firestore().collection(`projects/${projectId}/pull_requests`).where('id', '==', pr.id).get();
  if (!existingPr.empty) {
    return `PR ${pr.id} already exists in project ${projectId}`;
  }

  const project = await admin.firestore().doc(`projects/${projectId}`).get();
  const projectData = project.data();

  if (!projectData) {
    return `Project ${projectId} does not exists`;
  }

  const mappings = projectData.mappings;
  const creatorEmail = mappings.find((mapping: any) => mapping.githubName === pr.user.login)?.reviewerEmail;
  const creator = creatorEmail ?? pr.user.login;

  await admin.firestore().collection(`projects/${projectId}/pull_requests`).add({
    id: pr.id,
    creator
  });

  return `Create a new PR with id: ${pr.id}`;
}