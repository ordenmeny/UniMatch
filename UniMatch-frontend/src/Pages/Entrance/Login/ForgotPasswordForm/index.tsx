import { ValidationErrors } from "@/Base/ErrorMessages/ValidationErrors";
import { useFetch } from "@/Base/Hooks/useFetch";
import { MyInput } from "@/Base/UI/Inputs/MyInput";
import { ROUTES } from "@/Main/App/MyRouter";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { Spinner } from "@/Base/UI/Spinner";
import {
    fetchForgotPassword,
    type FetchForgotPasswordParams,
} from "@/Modules/User/Functions/fetchForgotPassword";
import defaultStyles from "../styles.module.scss";

export const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState } =
        useForm<FetchForgotPasswordParams>();
    const { fetchData, error, isLoading } = useFetch({
        fetchFunc: fetchForgotPassword,
        onSuccess: () => {
            alert("Вам на почту отправлена ссылка для сброса пароля.");
            navigate(ROUTES.LOGIN);
        },
    });
    return (
        <>
            <div className="form">
                <h1>Забыл пароль</h1>
                {error && (
                    <p className="error">
                        Пользователя с таким EMAIL не существует
                    </p>
                )}
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
            </div>
            <Link className={defaultStyles.ForgotPassword} to={ROUTES.LOGIN}>
                Вспомнил пароль
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
                        "Отправить письмо"
                    )}
                </button>
            </div>
        </>
    );
};
