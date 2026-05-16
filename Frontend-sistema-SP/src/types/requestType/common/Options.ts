export type Options<T=any> = {
    method: string;
    headers: Record<string, string>;
    body?: T;
}