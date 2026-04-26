import { Spinner } from "@/Base/UI/Spinner";
import { useMatches } from "../../Store/useMatches";
import Photo from "./Assets/photo.gif";
import styles from "./styles.module.scss";
import { useState, type HTMLAttributes } from "react";
import { MyA } from "@/Base/UI/MyA";

export const MatchesHistory = (props: HTMLAttributes<HTMLDivElement>) => {
    const matches = useMatches();
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={styles.Container} {...props}>
            <h2>История мэтчей</h2>
            <ul className={styles.MatchesHistory}>
                {!matches.history && (
                    <Spinner center={true} size="var(--fz-h2)" />
                )}
                {matches.history && matches.history.length === 0 && (
                    <div>Мэтчей нет</div>
                )}
                {matches.history &&
                    matches.history.length !== 0 &&
                    matches.history.map((match, index) => {
                        if (!isOpen && index >= 3) return;
                        return (
                            <li key={match.id}>
                                <img className={styles.Image} src={Photo} />
                                <MyA
                                    className={styles.Name}
                                    href={
                                        "https://t.me/" +
                                        match.partner.tg_link.slice(1)
                                    }
                                >
                                    {match.partner.first_name}{" "}
                                    {match.partner.last_name}
                                </MyA>
                                <div className={styles.Tags}>
                                    {match.partner.hobby.reduce(
                                        (prev, { name }) => {
                                            if (prev === "") return name;
                                            return prev + ", " + name;
                                        },
                                        ""
                                    )}
                                </div>
                            </li>
                        );
                    })}
                {matches.history && matches.history.length > 3 && (
                    <button
                        className="Button"
                        onClick={() => setIsOpen((val) => !val)}
                    >
                        {isOpen ? "Скрыть ←" : "Показать всех →"}
                    </button>
                )}
            </ul>
        </div>
    );
};
