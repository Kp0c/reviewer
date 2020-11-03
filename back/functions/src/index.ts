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
  await admin.firestore().collection(`projects/${projectId}/pull_requests`).add({
    id: pr.id,
    creator: pr.user.login
  });

  return `Create a new PR with id: ${pr.id}`;
}