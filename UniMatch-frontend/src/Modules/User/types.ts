import type { TagT } from "../Tag/types";

export type UserT = {
    first_name: string;
    last_name: string;
    email: string;
    birth: string;
    chat_id: null;
    image: null;
    hobby: TagT[];
    tg_link: string;
};
