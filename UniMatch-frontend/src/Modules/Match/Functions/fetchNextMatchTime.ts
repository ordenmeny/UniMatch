import { http } from "@/Base/Functions/http";

export interface FetchNextMatchTimeResponse {
    days_left: number; // полных дней до
    hours_left: number; // полных дней до + полных часов до
    minutes_left: number; // полных дней до + полных часов до + полных минут до
    next_match_at: string; // В общем виде дата-время след.мэтча ("2025-04-29 10:00:00")
}
export const fetchNextMatchTime = () => {
    return http.get<FetchNextMatchTimeResponse>("api/days-to-match/");
};
