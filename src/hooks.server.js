import {sequence} from "@sveltejs/kit/hooks";
//import * as Sentry from "@sentry/sveltekit";

/*Sentry.init({
    dsn: "https://b3581cc518dfa0ad74ad8bd851c28c1d@o1005541.ingest.us.sentry.io/4507436532957184",
    tracesSampleRate: 1
})

export const handleError = Sentry.handleErrorWithSentry();
*/
export const handle = /*sequence(Sentry.sentryHandle(),*/ async function /*_handle*/({ event, resolve }) {
  if (event.url.pathname == "/") {
    return Response.redirect(
      "https://" + event.url.hostname + "/" + new Date().getFullYear(),
    );
  }
  if (event.url.pathname.startsWith("/rule")) {
    console.log(event.url.href)
    return Response.redirect(
      "https://" + event.url.hostname + `${event.url.pathname.replace("/rule", `/${new Date().getFullYear()}/rule`)}`,
    );
  }
  // If no redirect is necessary, continue with the normal resolve process
  const response = await resolve(event);
  return response;
}/*)*/;