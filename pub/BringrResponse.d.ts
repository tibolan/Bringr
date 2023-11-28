import { BringrRequestInterface, BringrResponseOptionsInterface } from "./types";
declare class BringrResponse {
    options: BringrResponseOptionsInterface;
    /**
     * BringrResponse transform response into usable data
     * Could normalize response to a predictive and exhaustive format
     * Could automatically transform your response based on mime type
     * Supply text, json, blob, arrayBuffer, formData, and even base64 output
     * Could manage fetch duration
     * Internal code, should not use directly
     * @param options
     */
    constructor(options: BringrResponseOptionsInterface);
    private static setDuration;
    build(response: Response | null, request: BringrRequestInterface, error?: any, fromCache?: boolean): Promise<any>;
    json(res: Response): Promise<any>;
    form(res: Response): Promise<FormData>;
    buffer(res: Response): Promise<ArrayBuffer>;
    blob(res: Response): Promise<Blob>;
    base64(res: Response): Promise<unknown>;
    text(res: Response): Promise<string>;
    auto(res: Response): Promise<any>;
    autoBrutForce(res: Response): Promise<any>;
}
export default BringrResponse;
