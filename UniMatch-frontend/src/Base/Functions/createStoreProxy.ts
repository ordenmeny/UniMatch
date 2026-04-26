import type { StoreApi, UseBoundStore } from "zustand";

export const createStoreWithLoader = <T>(
    store: UseBoundStore<StoreApi<T>>,
    loader: () => void
) => {
    const func = (() => {
        let needLoad = true;
        return async () => {
            if (needLoad) {
                needLoad = false;
                await loader();
            }
        };
    })();

    return new Proxy(store, {
        apply(target, thisArg, argumentsList: Parameters<typeof store>) {
            func();
            return target.apply(thisArg, argumentsList);
        },
        get(target, property: keyof typeof store) {
            return target[property];
        },
    });
};
