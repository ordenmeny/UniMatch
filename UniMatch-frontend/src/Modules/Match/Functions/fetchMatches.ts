import { http } from "@/Base/Functions/http";
import type { MatchT } from "../types";

export interface FetchMatchesResponse {
    current_pair: MatchT;
    pairs: MatchT[];
}
export const fetchMatches = () => {
    return http.get<FetchMatchesResponse>("api/pairs/");
};
