import { LocalStorage } from "@/Base/Variables/localstorage";
import { Login } from "@/Pages/Entrance/Login";
import { ForgotPasswordForm } from "@/Pages/Entrance/Login/ForgotPasswordForm";
import { MainForm } from "@/Pages/Entrance/Login/MainForm";
import { Register } from "@/Pages/Entrance/Register";
import { ResetPassword } from "@/Pages/Entrance/ResetPassword";
import { About } from "@/Pages/Landings/About";
import { Index } from "@/Pages/Landings/Index";
import { Matches } from "@/Pages/Matches";
import { Settings } from "@/Pages/Settings";
import { Navigate, Outlet, Route, Routes } from "react-router";
import { PageSkeleton } from "../PageSkeleton";

export const ROUTES = {
    INDEX: "/",
    ABOUT: "/about",
    MATCHES: "/matches",
    SETTINGS: "/settings",
    LOGIN: "/login",
    FORGOT_PASSWORD: "/login/forgot_password",
    RESET_PASSWORD: "/password-reset/:uid/:token",
    REGISTER: "/register",
} as const;

const ProtectedRoute = () => {
    if (!localStorage.getItem(LocalStorage.TOKEN)) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }
    return <Outlet />;
};

export const MyRouter = () => {
    return (
        <Routes>
            <Route element={<PageSkeleton />}>
                <Route index element={<Index />} />
                <Route path={ROUTES.ABOUT} element={<About />} />
                <Route element={<ProtectedRoute />}>
                    <Route path={ROUTES.MATCHES} element={<Matches />} />
                    <Route path={ROUTES.SETTINGS} element={<Settings />} />
                </Route>
                <Route path="*" element={<h1>404</h1>} />
            </Route>
            <Route path={ROUTES.LOGIN} element={<Login />}>
                <Route index element={<MainForm />}></Route>
                <Route
                    path={ROUTES.FORGOT_PASSWORD.split("/").pop()}
                    element={<ForgotPasswordForm />}
                ></Route>
            </Route>
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
        </Routes>
    );
};
