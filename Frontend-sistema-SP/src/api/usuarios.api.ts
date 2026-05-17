
import {API_URL} from "../../Config";
import { getHeaders } from "@/utils";
import { type AdminUserResponse, type LoginRequest, type LoginResponse, type RegisterRequest, type RegisterResponse, type Response } from "@/types";
import { ApiRequest } from "./helpers/ApiRequest";

export async function LoginUser(loginRequest: LoginRequest): Promise<Response<LoginResponse>> {

    const response = await ApiRequest<LoginResponse, LoginRequest>(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: loginRequest
    });

    return response;

}

export async function RegisterUserAPi(registerRequest: RegisterRequest, token: string): Promise<Response<RegisterResponse>> {
    const response = await ApiRequest<RegisterResponse, RegisterRequest>(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(token),
        body: registerRequest
    });

    return response;
}

export async function GetAllUsersApi(token: string): Promise<Response<AdminUserResponse[]>> {
    const response = await ApiRequest<AdminUserResponse[], void>(`${API_URL}/admin/users`, {
        method: 'GET',
        headers: getHeaders(token),
    });
    return response;
}