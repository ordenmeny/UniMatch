import { http } from "@/Base/Functions/http";
import type { TagT } from "@/Modules/Tag/types";

interface FetchUserResponse {
    first_name: string;
    last_name: string;
    email: string;
    birth: string;
    chat_id: null;
    image: null;
    hobby: TagT[];
    tg_link: string;
}

export const fetchUser = () => {
    return http.get<FetchUserResponse>("api/auth/users/me/");
};
