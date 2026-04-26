import { useState, type HTMLAttributes } from "react";
import { BurgerButton } from "../BurgerButton";
import styles from "./styles.module.scss";
import { classname } from "@/Base/Functions/classname";
import { Link } from "react-router";
import type { UserT } from "@/Modules/User/types";
import { ROUTES } from "@/Main/App/MyRouter";
import { useUser } from "@/Modules/User/Store/useUser";
import { clearToken } from "@/Modules/User/Functions/saveToken";

interface BurgerNavbarProps extends HTMLAttributes<HTMLDivElement> {
    className: string;
    user: UserT | null;
}

export const BurgerNavbar = ({
    className,
    user,
    ...otherProps
}: BurgerNavbarProps) => {
    const [open, setOpen] = useState(false);
    const logout = useUser((state) => state.clear);
    return (
        <div
            className={classname(className, styles.BurgerNavbar)}
            {...otherProps}
        >
            <BurgerButton
                isActive={open}
                onClick={() => setOpen((open) => !open)}
            />
            <div className={classname(styles.Modal, { [styles.Open]: open })}>
                <BurgerButton
                    className={styles.ModalBurger}
                    isActive={open}
                    onClick={() => setOpen((open) => !open)}
                />
                <nav
                    onClick={(e) => {
                        if ((e.target as Element).nodeName === "A")
                            setOpen(false);
                    }}
                >
                    {user ? (
                        <>
                            <Link to={ROUTES.MATCHES}>Мои мэтчи</Link>
                            <Link to={ROUTES.SETTINGS}>
                                Редактировать профиль
                            </Link>
                            <Link
                                to={ROUTES.SETTINGS}
                                onClick={() => {
                                    logout();
                                    clearToken();
                                }}
                            >
                                Выйти
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="#">О проекте</Link>
                            <Link to="#">Правила</Link>
                            <Link
                                className={styles.BoldLink}
                                to={ROUTES.REGISTER}
                            >
                                Регистрация
                            </Link>
                            <Link className={styles.BoldLink} to={ROUTES.LOGIN}>
                                Вход
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </div>
    );
};
