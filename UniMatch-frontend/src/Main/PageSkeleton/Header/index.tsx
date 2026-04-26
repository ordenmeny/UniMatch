import MiniLogo from "@/Base/Assets/MiniLogoBlack.svg";
import { BurgerNavbar } from "./UI/BurgerNavbar";
import styles from "./styles.module.scss";
import { Navbar } from "./UI/Navbar";
import { useUser } from "@/Modules/User/Store/useUser";
import Photo from "@/Base/Assets/ebanutiyYasher.gif";
import { useNavigate } from "react-router";
import { ROUTES } from "@/Main/App/MyRouter";

export const Header = () => {
    const user = useUser();
    const navigate = useNavigate();
    return (
        <header className={styles.Header}>
            <div
                className={styles.Left}
                onClick={() =>
                    navigate(user.isAuth ? ROUTES.MATCHES : ROUTES.INDEX)
                }
            >
                <img className={styles.Logo} src={MiniLogo} />
                <div className={styles.Separator}></div>
                {user.isAuth ? (
                    <div className={styles.Panel}>
                        <img src={Photo} />
                        <span>{user.user.first_name}</span>
                    </div>
                ) : (
                    "Uni match"
                )}
            </div>
            <div className={styles.Right}>
                <Navbar user={user.user} className={styles.Navbar} />
                <BurgerNavbar
                    user={user.user}
                    className={styles.BurgerNavbar}
                />
            </div>
        </header>
    );
};
