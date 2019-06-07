const UAParser = require("ua-parser-js");

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

function getUAInfo(request) {
  const uaString = request.headers.get("user-agent");
  if (uaString == null) {
    return;
  }
  return UAParser(uaString);
}

function getReqHeaderObject(request) {
  const reqHeaders = {};
  new Map(request.headers).forEach((value, key) => {
    reqHeaders[key] = value;
  });
  return reqHeaders;
}

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  const uaInfo = getUAInfo(request);

  const body = {
    ip: request.headers.get("cf-connecting-ip"),
    country: request.headers.get("cf-ipcountry"),
    uaInfo,
    reqHeaders: getReqHeaderObject(request)
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json"
    },
    status: 200
  });
}
