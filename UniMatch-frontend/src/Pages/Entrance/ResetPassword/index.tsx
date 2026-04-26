import styles from "./styles.module.scss";

import { ValidationErrors } from "@/Base/ErrorMessages/ValidationErrors";
import { useFetch } from "@/Base/Hooks/useFetch";
import { MyInput } from "@/Base/UI/Inputs/MyInput";
import { Spinner } from "@/Base/UI/Spinner";
import { LocalStorage } from "@/Base/Variables/localstorage";
import { ROUTES } from "@/Main/App/MyRouter";
import { fetchResetPassword } from "@/Modules/User/Functions/fetchResetPassword";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Skeleton } from "../UI/Skeleton";
import { useParams } from "react-router";

export const ResetPassword = () => {
    const navigate = useNavigate();
    // { uid: string; token: string }
    const params = useParams();
    const { fetchData, error, isLoading } = useFetch({
        fetchFunc: (data) =>
            fetchResetPassword({
                token: params.token || '',
                uid: params.uid || '',
                new_password: data.password,
            }),
        onSuccess: () => {
            alert("Пароль изменен");
            navigate(ROUTES.LOGIN);
        },
    });
    const { register, handleSubmit, formState } = useForm<{
        password: string;
        confirmPassword: string;
    }>();
    useEffect(() => {
        if (localStorage.getItem(LocalStorage.TOKEN)) navigate(ROUTES.MATCHES);
    });
    return (
        <Skeleton className={styles.ResetPassword}>
            <h1>Восстановление пароля</h1>
            {error && <p className="error">Токен недействителен</p>}
            <div className="form">
                <MyInput
                    placeholder="Пароль"
                    type="password"
                    {...register("password", {
                        pattern: {
                            // eslint-disable-next-line no-useless-escape
                            value: /^(?=.*[A-Za-z]).{4,}$/,
                            message: ValidationErrors.password,
                        },
                        minLength: {
                            value: 5,
                            message: ValidationErrors.minLength(5),
                        },
                        maxLength: {
                            value: 50,
                            message: ValidationErrors.maxLength(50),
                        },
                        required: ValidationErrors.required,
                    })}
                    error={formState.errors.password?.message}
                />
                <MyInput
                    placeholder="Повтор пароля"
                    type="password"
                    {...register("confirmPassword", {
                        required: ValidationErrors.required,
                        validate: (value, formValues) => {
                            if (value !== formValues.password)
                                return "Пароли не совпадают";
                        },
                    })}
                    error={formState.errors.confirmPassword?.message}
                />
            </div>
            <div className={styles.Buttons + " buttons"}>
                <button
                    className="ButtonWhite"
                    onClick={handleSubmit(fetchData)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Spinner color="var(--PRIMARY_BLACK)" />
                    ) : (
                        "Сменить пароль"
                    )}
                </button>
            </div>
        </Skeleton>
    );
};
