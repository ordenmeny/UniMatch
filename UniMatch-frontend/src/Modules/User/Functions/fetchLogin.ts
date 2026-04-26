import { http } from "@/Base/Functions/http";

export interface FetchLoginParams {
    email: string;
    password: string;
}
export interface FetchLoginResponse {
    access: string;
}
export const fetchLogin = (params: FetchLoginParams) => {
    return http.post<FetchLoginResponse>("api/token/", { json: params });
};
