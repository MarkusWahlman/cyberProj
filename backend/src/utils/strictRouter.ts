// eslint-disable-next-line no-restricted-imports
import express from "express";
import type { RequestHandler } from "express";

export const StrictRouter = () => {
  const router = express.Router();
  const methods = ["get", "post", "put", "delete", "patch"] as const;

  methods.forEach((method) => {
    const original = router[method].bind(router) as (...args: unknown[]) => unknown;
    router[method] = ((path: string, ...handlers: RequestHandler[]) => {
      const authIndex = handlers.findIndex(
        (handler: RequestHandler & { isAuthMiddleware?: boolean }) =>
          handler.isAuthMiddleware === true,
      );
      const validationIndex = handlers.findIndex(
        (handler: RequestHandler & { isValidationMiddleware?: boolean }) =>
          handler.isValidationMiddleware === true,
      );

      if (authIndex === -1) {
        throw new Error(
          `FATAL: Route ${method.toUpperCase()} ${path} is missing an authentication middleware!`,
        );
      }

      const authHandler = handlers[authIndex] as RequestHandler & { allowLateAuth?: boolean };
      if (authIndex !== 0 && authHandler.allowLateAuth !== true) {
        throw new Error(
          `FATAL: Route ${method.toUpperCase()} ${path} must have authentication as its FIRST handler! Wrap it with lateAuth() if this is intentional.`,
        );
      }

      if (validationIndex === -1) {
        throw new Error(
          `FATAL: Route ${method.toUpperCase()} ${path} is missing a validation middleware! Use validate() or noValidation.`,
        );
      }

      return original(path, ...handlers);
    }) as unknown as (typeof router)[typeof method];
  });

  return router;
};
