import { useFetch } from "@/Base/Hooks/useFetch";
import { fetchNextMatchTime } from "../../Functions/fetchNextMatchTime";
import { formatTime } from "./Functions/formatTime";
import styles from "./styles.module.scss";
import { Spinner } from "@/Base/UI/Spinner";
import { useEffect } from "react";
import { useMatches } from "../../Store/useMatches";

export const NextMatch = () => {
    const updateMatches = useMatches((state) => state.updateMatches);
    const { response, isLoading, fetchData } = useFetch({
        fetchFunc: fetchNextMatchTime,
    });
    useEffect(() => {
        fetchData();
    }, []);
    useEffect(() => {
        if (!isLoading && response) {
            const msBeforeMatch =
                (response.days_left * 24 * 60 * 60 +
                    response.hours_left * 60 * 60 +
                    response.minutes_left * 60) *
                1000;
            console.log("setted timeout");
            const timeout = setTimeout(() => {
                updateMatches();
            }, msBeforeMatch);
            return () => {
                clearTimeout(timeout);
                console.log("cleared timeout");
            };
        }
    }, [isLoading]);
    return (
        <div className={styles.Container}>
            <h2>Следующий мэтч</h2>
            <div className={styles.NextMatch}>
                {response ? (
                    <button disabled className="ButtonTgray">
                        Через{" "}
                        {formatTime({
                            days: response?.days_left,
                            hours: response?.hours_left,
                            minutes: response?.minutes_left,
                        })}
                    </button>
                ) : (
                    <Spinner center={true} />
                )}
            </div>
        </div>
    );
};
