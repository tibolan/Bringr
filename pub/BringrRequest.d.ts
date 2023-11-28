import { BringrMethodsType, BringrRequestOptionsInterface, BringrQueryStringStrategyType, BringrRequestDefaultType, BringrRequestInterface } from "./types";
declare class BringrRequest implements BringrRequestInterface {
    url: string;
    body: any;
    cacheable: number;
    cancellable: boolean;
    duration: number;
    startAt: number;
    endAt: number;
    headers: any;
    ignoreCache: boolean;
    method: BringrMethodsType;
    query: any;
    retry: {
        max: number;
        delay: number;
        attempt: number;
        condition: any;
    };
    timeout: number;
    /**
     * BringrRequest build a valid Request
     * Advanced query build options and a retry management
     * Internal code, should not use directly
     * @param request
     * @param config
     */
    constructor(request: BringrRequestDefaultType, config: BringrRequestOptionsInterface);
    buildURI(basePath: string, request: BringrRequestDefaultType, strategy: BringrQueryStringStrategyType): void;
    processQuery(url: URL, strategy: BringrQueryStringStrategyType): void;
    buildBody(request: BringrRequestDefaultType): false | undefined;
    checkRetry(response: any, request: BringrRequestInterface): Promise<boolean>;
    checkCondition(condition: any, response: any, request: BringrRequestInterface): boolean;
}
export default BringrRequest;
