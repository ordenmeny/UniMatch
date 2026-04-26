import { http } from "@/Base/Functions/http";

export interface FetchForgotPasswordParams {
    email: string;
}
export const fetchForgotPassword = (params: FetchForgotPasswordParams) => {
    return http.post("api/auth/users/reset_password/", { json: params });
};
    