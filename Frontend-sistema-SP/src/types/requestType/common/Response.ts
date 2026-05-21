
export type ValidationError = {
    field: string;
    message: string;
}

export type Response<T> = {
    responseCode: number;
    responseMessage: string;
    data?: T;
    errorList?: Array<string | ValidationError>;
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
    totalData?: number;
}