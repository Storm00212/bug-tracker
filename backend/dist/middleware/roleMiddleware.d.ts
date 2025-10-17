import { Request, Response, NextFunction } from "express";
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}
export declare const authorizeRoles: (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=roleMiddleware.d.ts.map