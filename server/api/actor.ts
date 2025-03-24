export default defineEventHandler((event) => {
  const accept = getHeader(event, "accept");
  if (accept?.includes("activity")) {
   
    return {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
        "https://purl.archive.org/socialweb/webfinger",
      ],
      id: "https://frctools.com/api/actor",
      type: "Person",
      attachment: [],
      name: "FRCTools",
      icon: {
        type: "Image",
        url: "https://frctools.com/logo.png",
      },
      published: "1987-12-12T11:34:44Z",
      summary: "",
      tag: [],
      url: "https://frctools.com/api/actor",
      streams: [],
      preferredUsername: "",
      movedTo: false,
      alsoKnownAs: [],
      webfinger: "",
    };
  }
  return sendRedirect(event, "/");
});
