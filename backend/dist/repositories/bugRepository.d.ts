import { Bug } from "../models/Bug.js";
export declare const createBug: (bug: Bug) => Promise<any>;
export declare const getBugsByProject: (projectId: number) => Promise<import("mssql").IRecordSet<any>>;
//# sourceMappingURL=bugRepository.d.ts.map