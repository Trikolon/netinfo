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

function traverseObject(pathArr, obj) {
  if (pathArr.length === 0) {
    return obj;
  }
  const key = pathArr.shift();

  if (!obj.hasOwnProperty(key)) {
    return obj;
  }

  return traverseObject(pathArr, obj[key]);
}

function filterBodyByPath(request, body) {
  const url = new URL(request.url);
  const pathName = url.pathname;

  // No filter
  if (pathName === "/") {
    return body;
  }

  const objectPath = url.pathname.split("/");
  if (objectPath.length < 2) {
    return body;
  }

  // Remove first empty element (caused by leading '/' of url)
  objectPath.shift();

  return traverseObject(objectPath, body);
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

  const filteredBody = filterBodyByPath(request, body);
  const contentType =
    typeof filteredBody === "object" ? "application/json" : "text/plain";
  const stringBody =
    typeof filteredBody === "string"
      ? filteredBody
      : JSON.stringify(filteredBody, null, 2);

  return new Response(stringBody, {
    headers: {
      "Content-Type": contentType
    },
    status: 200
  });
}
