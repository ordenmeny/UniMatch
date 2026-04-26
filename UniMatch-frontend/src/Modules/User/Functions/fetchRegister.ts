import { http } from "@/Base/Functions/http";
import type { UserT } from "@/Modules/User/types";

export interface FetchRegisterParams {
    email: string;
    first_name: string;
    last_name: string;
    birth: string;
    password: string;
    hobby: number[];
    tg_link: string;
}
export interface FetchRegisterResponse {
    user: UserT;
    access: string;
}
export const fetchRegister = (params: FetchRegisterParams) => {
    return http.post<FetchRegisterResponse>("api/register/", {
        json: params,
    });
};
