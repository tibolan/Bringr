import BringrAbort from "./BringrAbort.js";
import { BringrMethodsType, BringrRequestInterface, BringrRequestDefaultType, BringrOptionsInterface } from "./types";
declare class Bringr {
    config: BringrOptionsInterface;
    private cache;
    protected aborter: BringrAbort;
    private response;
    private loading;
    constructor(options: BringrOptionsInterface);
    fetch(method: BringrMethodsType, requestDefinition: BringrRequestDefaultType): Promise<any>;
    GET(request: BringrRequestDefaultType | string): Promise<any>;
    DELETE(request: BringrRequestDefaultType): Promise<any>;
    HEAD(request: BringrRequestDefaultType): Promise<any>;
    POST(request: BringrRequestDefaultType): Promise<any>;
    PUT(request: BringrRequestDefaultType): Promise<any>;
    PATCH(request: BringrRequestDefaultType): Promise<any>;
    abortRequest(request: BringrRequestInterface): Promise<void>;
    deleteCache(request: BringrRequestInterface): Promise<void>;
    clearCache(request: BringrRequestInterface): Promise<void>;
}
export default Bringr;
