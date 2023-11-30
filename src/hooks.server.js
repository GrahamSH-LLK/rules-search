export async function handle({ event, resolve }) {
    if (event.url.pathname == '/') {
        const headers = new Headers({
            location: 
            '/' + new Date().getFullYear(),
        });
        return {
            status: 302,
            headers,
        };

    }
    if (event.url.pathname.startsWith('/rule')) {
        const headers = new Headers({
            location: `${event.url.href.replace('/rule', `/${new Date().getFullYear()}/rule`)}`,
        });
        return {
            status: 302,
            headers,
        };

    }
    // If no redirect is necessary, continue with the normal resolve process
    const response = await resolve(event);
    return response;
};
