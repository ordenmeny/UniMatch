import { ValidationErrors } from "@/Base/ErrorMessages/ValidationErrors";
import { useFetch } from "@/Base/Hooks/useFetch";
import { MyInput } from "@/Base/UI/Inputs/MyInput";
import { ROUTES } from "@/Main/App/MyRouter";
import {
    fetchLogin,
    type FetchLoginParams,
} from "@/Modules/User/Functions/fetchLogin";
import { saveToken } from "@/Modules/User/Functions/saveToken";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { Spinner } from "@/Base/UI/Spinner";
import { useUser } from "@/Modules/User/Store/useUser";
import defaultStyles from "../styles.module.scss";

export const MainForm = () => {
    const { register, handleSubmit, formState } = useForm<FetchLoginParams>();
    const navigate = useNavigate();
    const updateUser = useUser((state) => state.updateUser);
    const { fetchData, error, isLoading } = useFetch({
        fetchFunc: fetchLogin,
        onSuccess: (body) => {
            saveToken(body.access);
            updateUser();
            navigate(ROUTES.MATCHES);
        },
    });
    return (
        <>
            <div className="form">
                <h1>Вход</h1>
                {error && <p className="error">{error}</p>}
                <MyInput
                    placeholder="Введите email"
                    {...register("email", {
                        pattern: {
                            value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                            message: ValidationErrors.email,
                        },
                        required: ValidationErrors.required,
                    })}
                    error={formState.errors.email?.message}
                />
                <MyInput
                    placeholder="Введите пароль"
                    type="password"
                    {...register("password", {
                        required: ValidationErrors.required,
                    })}
                    error={formState.errors.password?.message}
                />
            </div>
            <Link className={defaultStyles.ForgotPassword} to={ROUTES.FORGOT_PASSWORD}>
                Забыл пароль
            </Link>
            <div className={defaultStyles.Buttons + " buttons"}>
                <button
                    className="ButtonWhite"
                    onClick={handleSubmit(fetchData)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Spinner color="var(--PRIMARY_BLACK)" />
                    ) : (
                        "Войти"
                    )}
                </button>
                <Link className="ButtonDarkgray" to={ROUTES.REGISTER}>
                    Нет аккаунта
                </Link>
            </div>
        </>
    );
};
