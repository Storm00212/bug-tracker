import { Request, Response } from "express";
/** Register a new user */
export declare const registerUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/** Login user */
export declare const loginUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authController.d.ts.map