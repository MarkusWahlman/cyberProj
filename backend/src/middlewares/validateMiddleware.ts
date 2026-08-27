import { ZodError } from "zod";
// eslint-disable-next-line no-restricted-imports
import type { Request, NextFunction, RequestHandler } from "express";
import type { TypedResponse } from "../utils/typedExpress.ts";
import type { ErrorResponse } from "shared";

export interface ZodSchemaCompatible {
  parseAsync(data: unknown): Promise<unknown>;
}

export const markAsValidation = (fn: RequestHandler) => {
  (fn as RequestHandler & { isValidationMiddleware?: boolean }).isValidationMiddleware = true;
  return fn;
};

export const noValidation = markAsValidation(
  (_req: Request, _res: TypedResponse<unknown>, next: NextFunction) => {
    next();
  },
);

export const validate = (schemas: {
  body?: ZodSchemaCompatible;
  query?: ZodSchemaCompatible;
  params?: ZodSchemaCompatible;
}) => {
  return markAsValidation(
    async (req: Request, res: TypedResponse<ErrorResponse>, next: NextFunction) => {
      try {
        if (schemas.body) {
          req.body = await schemas.body.parseAsync(req.body);
        }
        if (schemas.query) {
          req.query = await schemas.query.parseAsync(req.query);
        }
        if (schemas.params) {
          req.params = await schemas.params.parseAsync(req.params);
        }
        return next();
      } catch (error: unknown) {
        if (error instanceof ZodError || (error as Error)?.name === "ZodError") {
          res.status(400).json({
            message: "Validation failed",
            errors: typeof error.format === "function" ? error.format() : error.issues,
          });
          return;
        }
        return next(error);
      }
    },
  );
};
