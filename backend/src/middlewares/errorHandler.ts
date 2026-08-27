// eslint-disable-next-line no-restricted-imports
import type { Request, NextFunction } from "express";
import type { TypedResponse } from "../utils/typedExpress.ts";
import type { ErrorResponse } from "shared";
import logger from "../utils/logger.ts";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: TypedResponse<ErrorResponse>,
  _next: NextFunction,
) => {
  logger.error(err);
  res.status(500).json({ message: "Internal Server Error" });
};
