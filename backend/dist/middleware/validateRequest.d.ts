import { Request, Response, NextFunction } from "express";
import { z } from "zod";
export declare const validateRequest: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validateRequest.d.ts.map