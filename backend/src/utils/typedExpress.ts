// eslint-disable-next-line no-restricted-imports
import type { Response, Request } from "express";

export type TypedResponse<T> = Response<T>;

export type TypedRequestBody<T> = Request<Record<string, never>, unknown, T>;
export type TypedRequestQuery<T> = Request<Record<string, never>, unknown, unknown, T>;
export type TypedRequest<TBody = unknown, TQuery = unknown> = Request<
  Record<string, never>,
  unknown,
  TBody,
  TQuery
>;
export type TypedRequestParams<TParams, TBody = unknown, TQuery = unknown> = Request<
  TParams,
  unknown,
  TBody,
  TQuery
>;
