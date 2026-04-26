import { useEffect } from "react";
import { useUser } from "../User/Store/useUser";
import { YANDEX_METRIKA_CONFIG } from "./config";

export const TrackerMatches = () => {
    const userEmail = useUser((state) => state.user?.email);
    useEffect(() => {
        if (window.ym && userEmail) {
            // Сообщаем Метрике, что пользователь вошёл в личный кабинет
            window.ym(
                YANDEX_METRIKA_CONFIG.METRIKA_ID,
                "reachGoal",
                "enter_dashboard",
                {
                    email: userEmail,
                }
            );

            // Также можно задать userParams (для User ID)
            window.ym(YANDEX_METRIKA_CONFIG.METRIKA_ID, "userParams", {
                email: userEmail,
            });

            console.log("[YandexMetrika] User entered dashboard");
        }
    }, [userEmail]);
    return <></>;
};
