import { useEffect } from "react";
import { useLocation } from "react-router";
import { YANDEX_METRIKA_CONFIG } from "./config";

export const Tracker = () => {
    const location = useLocation();

    useEffect(() => {
        if (window.ym) {
            window.ym(YANDEX_METRIKA_CONFIG.METRIKA_ID, "hit", location);
            console.log("[YandexMetrika] Page view:", location);
        }
    }, [location]);

    return null;
};
