import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const HEADER = "x-request-id";
const SAFE_REQUEST_ID = /^[a-zA-Z0-9_.:-]{1,128}$/;

export function requestId(): RequestHandler {
  return (req, res, next) => {
    const incoming = req.header(HEADER);
    const id = incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();

    req.requestId = id;
    res.setHeader(HEADER, id);
    next();
  };
}
