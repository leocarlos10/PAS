
import {API_URL} from "../../Config";
import {  getHeaders} from "@/utils";
import { type LoginRequest, type LoginResponse, type Response } from "@/types";
import { ApiRequest } from "./helpers/ApiRequest";

export async function LoginUser(loginRequest: LoginRequest): Promise<Response<LoginResponse>> {

    const response = await ApiRequest<LoginResponse, LoginRequest>(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: loginRequest
    });

    return response;

}