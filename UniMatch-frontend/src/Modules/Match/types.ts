import type { UserT } from "../User/types";

export type MatchUserT = Omit<UserT, "birth" | "chat_id" | "image"> & {
    id: number;
};

export type MatchT = {
    id: number;
    partner: MatchUserT;
    created_at: string;
};
