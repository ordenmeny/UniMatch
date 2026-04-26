import { http } from "@/Base/Functions/http";
import type { TagT } from "@/Modules/Tag/types";

export interface FetchUpdateUserParams {
    first_name?: string;
    last_name?: string;
    birth?: string;
    hobby?: number[];
    tg_link?: string;
}

export interface FetchUpdateUserResponse {
    first_name: string;
    last_name: string;
    email: string;
    birth: string;
    chat_id: null;
    image: null;
    hobby: TagT[];
}

export const fetchUpdateUser = (params: FetchUpdateUserParams) => {
    return http.patch<FetchUpdateUserResponse>("api/auth/users/me/", {
        json: params,
    });
};
