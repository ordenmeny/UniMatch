import { NextMatch } from "@/Modules/Match/Widgets/NextMatch";
import styles from "./styles.module.scss";

import { CurrentMatch } from "@/Modules/Match/Widgets/CurrentMatch";
import { MatchesHistory } from "@/Modules/Match/Widgets/MatchesHistory";
import { TrackerMatches } from "@/Modules/YandexMetrika/TrackerMatches";

export const Matches = () => {
    return (
        <div className={styles.Matches}>
            <TrackerMatches />
            <div className={styles.Top}>
                <CurrentMatch />
                <NextMatch />
            </div>
            <MatchesHistory />
        </div>
    );
};
