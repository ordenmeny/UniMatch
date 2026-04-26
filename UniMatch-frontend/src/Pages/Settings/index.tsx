import { ValidationErrors } from "@/Base/ErrorMessages/ValidationErrors";
import { useFetch } from "@/Base/Hooks/useFetch";
import { Error } from "@/Base/UI/Error";
import { MyDateInput } from "@/Base/UI/Inputs/MyDateInput";
import { MyInput } from "@/Base/UI/Inputs/MyInput";
import { Spinner } from "@/Base/UI/Spinner";
import {
    fetchUpdateUser,
    type FetchUpdateUserParams,
} from "@/Modules/User/Functions/fetchUpdateUser";
import { useUser } from "@/Modules/User/Store/useUser";
import { UserTagSelector } from "@/Modules/User/Widgets/UserTagSelector";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";
import { useNavigate } from "react-router";
import { ROUTES } from "@/Main/App/MyRouter";

export const Settings = () => {
    const user = useUser();
    const { register, handleSubmit, formState } = useForm<
        // значения в react hook forms для массивов из инпутов всегда строковые, меняю их на числовые во время передачи данных какой-то функции
        Required<FetchUpdateUserParams & { hobby: string[] }>
    >();
    const navigate = useNavigate();
    const { fetchData, error, isLoading } = useFetch({
        fetchFunc: fetchUpdateUser,
        onSuccess: user.updateUser,
    });
    if (!user.user) return <Spinner center={true} />;
    return (
        <div className={styles.Settings}>
            <h2>Твои теги</h2>
            {error && <Error fzMul={0.9}>{error}</Error>}
            <UserTagSelector
                error={formState.errors.hobby?.message}
                propsToInput={{
                    ...register("hobby", {
                        validate: (value) => {
                            if (value.length < 3)
                                return ValidationErrors.min(3);
                            if (value.length > 10)
                                return ValidationErrors.max(10);
                        },
                    }),
                }}
            />
            <h2>Профиль</h2>
            <div className={styles.ProfilePanel}>
                <MyInput
                    placeholder="Имя"
                    error={formState.errors.first_name?.message}
                    {...register("first_name", {
                        required: ValidationErrors.required,
                        pattern: {
                            value: /^[A-Za-zА-Яа-я.@+-]+$/u,
                            message: ValidationErrors.allowedSymbols(
                                `латинские буквы, цифры 0-9, символы "_+-@."`
                            ),
                        },
                    })}
                    defaultValue={user.user?.first_name}
                />
                <MyInput
                    placeholder="Фамилия"
                    error={formState.errors.last_name?.message}
                    {...register("last_name", {
                        required: ValidationErrors.required,
                        pattern: {
                            value: /^[A-Za-zА-Яа-я.@+-]+$/u,
                            message: ValidationErrors.allowedSymbols(
                                `латинские буквы, цифры 0-9, символы "_+-@."`
                            ),
                        },
                    })}
                    defaultValue={user.user?.last_name}
                />
                <MyDateInput
                    placeholder="Дата рождения"
                    defaultValue={user.user?.birth}
                    error={formState.errors.birth?.message}
                    {...register("birth", {
                        required: ValidationErrors.required,
                    })}
                />
                <MyInput
                    placeholder="Ник в Telegram"
                    error={formState.errors.tg_link?.message}
                    defaultValue={user.user?.tg_link}
                    {...register("tg_link", {
                        pattern: {
                            value: /^@[A-Za-z0-9_]+$/,
                            message: ValidationErrors.badFormat("(@username)"),
                        },
                        minLength: {
                            value: 5,
                            message: ValidationErrors.minLength(5),
                        },
                        maxLength: {
                            value: 32,
                            message: ValidationErrors.maxLength(32),
                        },
                        required: ValidationErrors.required,
                    })}
                />
                <button
                    className={"ButtonWhite " + styles.SubmitBtn}
                    onClick={handleSubmit((data) => {
                        fetchData({
                            ...data,
                            hobby: data.hobby.map((val) => +val),
                        });
                        navigate(ROUTES.MATCHES);
                    })}
                    disabled={isLoading}
                >
                    Сохранить
                </button>
            </div>
        </div>
    );
};
