import styles from "./styles.module.scss";

import { LocalStorage } from "@/Base/Variables/localstorage";
import { ROUTES } from "@/Main/App/MyRouter";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { Skeleton } from "../UI/Skeleton";

export const Login = () => {
    const navigate = useNavigate();
    useEffect(() => {
        if (localStorage.getItem(LocalStorage.TOKEN)) navigate(ROUTES.MATCHES);
    });
    return (
        <Skeleton className={styles.Login}>
            <Outlet />
        </Skeleton>
    );
};
