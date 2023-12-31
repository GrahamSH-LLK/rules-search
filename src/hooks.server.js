export async function handle({ event, resolve }) {
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
}
