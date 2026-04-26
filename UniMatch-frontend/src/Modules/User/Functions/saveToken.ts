import { LocalStorage } from "@/Base/Variables/localstorage";

export const saveToken = (token: string) => {
    localStorage.setItem(LocalStorage.TOKEN, "Bearer " + token);
};

export const clearToken = () => {
    localStorage.removeItem(LocalStorage.TOKEN);
};
