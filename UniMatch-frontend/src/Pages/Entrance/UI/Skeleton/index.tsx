import styles from "./styles.module.scss";

import LogoText from "@/Base/Assets/LogoTextWhite.svg";
import { ROUTES } from "@/Main/App/MyRouter";
import { type HTMLProps } from "react";
import { useNavigate } from "react-router";

export const Skeleton = ({
    className,
    ...props
}: HTMLProps<HTMLDivElement>) => {
    const navigate = useNavigate();
    return (
        <div
            className={styles.Skeleton + " " + className}
            {...props}
        >
            <header className={styles.Header}>
                <img className={styles.Logo} src={LogoText} onClick={() => navigate(ROUTES.INDEX)}/>
            </header>
            <div className={styles.Modal}>{props.children}</div>
        </div>
    );
};
