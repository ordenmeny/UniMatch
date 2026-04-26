import { createStoreWithLoader } from "@/Base/Functions/createStoreProxy";
import { create } from "zustand";
import { fetchMatches } from "../Functions/fetchMatches";
import type { MatchT } from "../types";

interface MatchesStoreI {
    wasLoaded: boolean;
    currentPair: MatchT | null;
    history: MatchT[] | null;
    updateMatches: () => void;
    clear: () => void;
}

const _useMatches = create<MatchesStoreI>((set) => {
    const updateMatches = async () => {
        const res = await fetchMatches();
        const body = await res.json();
        set({
            wasLoaded: true,
            currentPair: body.current_pair,
            history: body.pairs,
        });
    };
    return {
        wasLoaded: false,
        currentPair: null,
        history: null,
        updateMatches,
        clear: () => set({ history: null }),
    };
});

export const useMatches = createStoreWithLoader(_useMatches, async () => {
    _useMatches.getState().updateMatches();
});
