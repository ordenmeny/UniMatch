import { http } from "@/Base/Functions/http";
import type { TagT } from "@/Modules/Tag/types";

export interface FetchUserAndTotalTagsResponse {
    user_tags: TagT[];
    all_tags: TagT[];
}

export const fetchUserAndTotalTags = () => {
    return http.get<FetchUserAndTotalTagsResponse>("api/hobby/total/");
};
