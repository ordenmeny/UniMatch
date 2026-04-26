import { createStoreWithLoader } from "@/Base/Functions/createStoreProxy";
import { create } from "zustand";
import { fetchUser } from "../Functions/fetchUser";
import type { UserT } from "../types";
import { LocalStorage } from "@/Base/Variables/localstorage";

interface UserAuth {
    isAuth: true;
    user: UserT;
}
interface UserNotAuth {
    isAuth: false;
    user: null;
}

type UserStoreI = (UserAuth | UserNotAuth) & {
    updateUser: () => void;
    clear: () => void;
};

const _useUser = create<UserStoreI>((set) => {
    const updateUser = async () => {
        if (!localStorage.getItem(LocalStorage.TOKEN)) return;
        const res = await fetchUser();
        const body = await res.json();
        set({
            isAuth: true,
            user: body,
        });
    };
    return {
        isAuth: false,
        user: null,
        updateUser,
        clear: () => set({ isAuth: false, user: null }),
    };
});

export const useUser = createStoreWithLoader(_useUser, async () => {
    _useUser.getState().updateUser();
});
