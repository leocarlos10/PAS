export type LoginResponse = {
    id:number;
    username: string;
    roles: string[];
    access_token: string;
    token_type: string;
}
