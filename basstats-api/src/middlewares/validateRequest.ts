import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

interface RequestValidators {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validateRequest = (validators: RequestValidators) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (validators.body) {
        req.body = await validators.body.parseAsync(req.body);
      }
      if (validators.query) {
        req.query = (await validators.query.parseAsync(req.query)) as Request["query"];
      }
      if (validators.params) {
        req.params = (await validators.params.parseAsync(req.params)) as Request["params"];
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
