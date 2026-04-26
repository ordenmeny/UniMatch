import { http } from "@/Base/Functions/http";

export interface FetchResetPasswordParams {
    uid: string;
    token: string;
    new_password: string;
}
export const fetchResetPassword = (params: FetchResetPasswordParams) => {
    return http.post("api/auth/users/reset_password_confirm/", {
        json: params,
    });
};
