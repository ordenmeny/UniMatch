import { http } from "@/Base/Functions/http";
import type { TagT } from "../types";

export type FetchTagsResponse = TagT[];
export const fetchTags = () => {
    return http.get<FetchTagsResponse>("api/hobby/all/");
};
