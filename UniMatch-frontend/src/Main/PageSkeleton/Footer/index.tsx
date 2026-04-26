import { Link } from "react-router";
import styles from "./styles.module.scss";

import BigLogo from "@/Base/Assets/BigLogo.svg";

export const Footer = () => {
    return (
        <footer className={styles.Footer}>
            <img className={styles.Logo} src={BigLogo} />
            <div className={styles.Right}>
                <Link to="#">О проекте</Link>
                <Link to="#">F.A.Q.</Link>
                <Link to="https://disk.yandex.ru/d/DnB7luk2VxTXRQ">Правила</Link>
                <Link to="https://disk.yandex.ru/d/DnB7luk2VxTXRQ">Политика конфидециальности</Link>
                <Link to="https://t.me/unimatch_unit">Наш Telegram</Link>
                <Link to="#">Поддержка</Link>
                <span>support@unimatch.ru</span>
            </div>
        </footer>
    );
};
