import { Footer } from "@/Main/PageSkeleton/Footer";
import { Header } from "@/Main/PageSkeleton/Header";
import { Outlet } from "react-router";
import styles from "./styles.module.scss";

export const PageSkeleton = () => {
    return (
        <div className={styles.PageSkeleton}>
            <Header />
            <Outlet />
            <Footer />
        </div>
    );
};
