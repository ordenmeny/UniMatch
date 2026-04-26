import styles from "./styles.module.scss";

import { ValidationErrors } from "@/Base/ErrorMessages/ValidationErrors";
import { useFetch } from "@/Base/Hooks/useFetch";
import { Carousel, type CarouselRef } from "@/Base/UI/Carousel";
import { CarouselIndicator } from "@/Base/UI/Carousel/CarouselIndicator";
import { MyDateInput } from "@/Base/UI/Inputs/MyDateInput";
import { MyInput } from "@/Base/UI/Inputs/MyInput";
import { MyCheckbox } from "@/Base/UI/MyCheckbox";
import { Spinner } from "@/Base/UI/Spinner";
import {
    fetchRegister,
    type FetchRegisterParams,
} from "@/Modules/User/Functions/fetchRegister";
import { saveToken } from "@/Modules/User/Functions/saveToken";
import { fetchTags as fetchTagsFunc } from "@/Modules/Tag/Functions/fetchTags";
import { TagSelector } from "@/Modules/Tag/UI/TagSelector";
import type { TagT } from "@/Modules/Tag/types";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Skeleton } from "../UI/Skeleton";
import { ROUTES } from "@/Main/App/MyRouter";
import { LocalStorage } from "@/Base/Variables/localstorage";
import { useUser } from "@/Modules/User/Store/useUser";
import { MyA } from "@/Base/UI/MyA";

interface FormI extends FetchRegisterParams {
    confirmPassword: string;
    agreePrivacy: boolean;
    agreeTermsOfUse: boolean;
    agreePersonalData: boolean;
}

const maxPosition = 4;
export const Register = () => {
    useEffect(() => {
        if (localStorage.getItem(LocalStorage.TOKEN)) navigate(ROUTES.MATCHES);
    });

    // более простого решения я не нашел, поэтому на каждую страницу отдельная форма
    // единственный существенный недостаток - необходимость итерироваться по каждой форме,
    // чтобы собрать все данные полей вместе
    const form1 = useForm<FormI>();
    const form2 = useForm<FormI>();
    const form3 = useForm<FormI>();
    const form4 = useForm<FormI>();

    const forms = [form1, form2, form3, form4];

    const [carouselPos, setCarouselPos] = useState(0);
    const carouselRef = useRef<CarouselRef>(null);
    const updateUser = useUser((state) => state.updateUser);
    const navigate = useNavigate();
    const { fetchData, error, isLoading } = useFetch({
        fetchFunc: fetchRegister,
        onSuccess: (body) => {
            saveToken(body.access);
            updateUser();
            navigate(ROUTES.MATCHES);
        },
    });
    const tagsFetch = useFetch({
        fetchFunc: fetchTagsFunc,
    });
    useEffect(() => {
        tagsFetch.fetchData();
    }, []);
    const goForward = async () => {
        const validationResult = await forms[carouselPos].trigger();
        if (validationResult) carouselRef.current?.goForward();
    };
    const submit = async () => {
        const validationResult = await forms[carouselPos].trigger();
        if (!validationResult) return;
        // @ts-expect-error Необходимые поля добавятся после цикла ниже
        let data: FormI = {};
        for (const form of forms) {
            const result = form.watch();
            data = { ...data, ...result };
        }
        fetchData({
            ...data,
            hobby: data.hobby.map((val) => +val),
        });
    };

    return (
        <Skeleton className={styles.Register}>
            <div className="form">
                <h1>Регистрация</h1>
                {error && <p className="error">{error}</p>}
                <CarouselIndicator
                    className="carouselIndicator"
                    position={carouselPos}
                    maxPosition={maxPosition}
                />
                <Carousel
                    position={carouselPos}
                    setPosition={setCarouselPos}
                    ref={carouselRef}
                    tapeClassname={styles.CarouselTape}
                >
                    <div>
                        <p>
                            Давай знакомиться! Заполни немного информации о себе
                        </p>
                        <MyInput
                            placeholder="Имя"
                            {...form1.register("first_name", {
                                required: ValidationErrors.required,
                                pattern: {
                                    value: /^[A-Za-zА-Яа-я.@+-]+$/u,
                                    message: ValidationErrors.allowedSymbols(
                                        `латинские буквы, цифры 0-9, символы "_+-@."`
                                    ),
                                },
                            })}
                            error={form1.formState.errors.first_name?.message}
                        />
                        <MyInput
                            placeholder="Фамилия"
                            {...form1.register("last_name", {
                                required: ValidationErrors.required,
                                pattern: {
                                    value: /^[A-Za-zА-Яа-я.@+-]+$/u,
                                    message: ValidationErrors.allowedSymbols(
                                        `латинские буквы, цифры 0-9, символы "_+-@."`
                                    ),
                                },
                            })}
                            error={form1.formState.errors.last_name?.message}
                        />
                        <MyDateInput
                            placeholder="Дата рождения"
                            {...form1.register("birth", {
                                required: ValidationErrors.required,
                                validate: (value) => {
                                    // 32503680000000 - 1 января 3000г
                                    if (
                                        new Date(value).getTime() >=
                                        32503680000000
                                    )
                                        return "Слишком большая дата";
                                },
                            })}
                            error={form1.formState.errors.birth?.message}
                        />
                    </div>
                    <div>
                        <p>
                            Хотим знать о вас больше! Выберите то, что вам
                            действительно нравится (от 3 до 10 тегов)
                        </p>
                        {tagsFetch.isLoading ? (
                            <Spinner />
                        ) : (
                            <>
                                {form2.formState.errors.hobby?.message && (
                                    <p className="error">
                                        {form2.formState.errors.hobby?.message}
                                    </p>
                                )}
                                <TagSelector
                                    className={styles.TagSelector}
                                    tags={tagsFetch.response || []}
                                    propsToInput={{
                                        ...form2.register("hobby", {
                                            validate: (value) => {
                                                if (value.length < 3)
                                                    return ValidationErrors.min(
                                                        3
                                                    );
                                                if (value.length > 10)
                                                    return ValidationErrors.max(
                                                        10
                                                    );
                                            },
                                            setValueAs: (value: TagT) =>
                                                +value.id,
                                        }),
                                    }}
                                />
                            </>
                        )}
                    </div>
                    <div>
                        <p>Осталось совсем немного</p>
                        <MyInput
                            placeholder="Email"
                            {...form3.register("email", {
                                pattern: {
                                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                                    message: ValidationErrors.email,
                                },
                                required: ValidationErrors.required,
                            })}
                            error={form3.formState.errors.email?.message}
                        />
                        <MyInput
                            placeholder="Ник в телеграмм (@username)"
                            {...form3.register("tg_link", {
                                pattern: {
                                    value: /^@[A-Za-z0-9_]+$/,
                                    message:
                                        ValidationErrors.badFormat(
                                            "(@username)"
                                        ),
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
                            error={form3.formState.errors.tg_link?.message}
                        />
                        <br />
                        <MyInput
                            placeholder="Пароль"
                            type="password"
                            {...form3.register("password", {
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
                            error={form3.formState.errors.password?.message}
                        />
                        <MyInput
                            placeholder="Повтор пароля"
                            type="password"
                            {...form3.register("confirmPassword", {
                                required: ValidationErrors.required,
                                validate: (value, formValues) => {
                                    if (value !== formValues.password)
                                        return "Пароли не совпадают";
                                },
                            })}
                            error={
                                form3.formState.errors.confirmPassword?.message
                            }
                        />
                    </div>
                    <div>
                        <p>Для работы нам нужно пару подтверждений</p>
                        <MyCheckbox
                            {...form4.register("agreeTermsOfUse", {
                                required: ValidationErrors.required,
                            })}
                            className={styles.Checkbox}
                        >
                            Я согласен с{" "}
                            <MyA
                                style={{
                                    textDecoration: "underline",
                                    color: "var(--PRIMARY_WHITE)",
                                }}
                                href="https://disk.yandex.ru/i/xm39S7Dbhbb47w"
                            >
                                Условиями пользования
                            </MyA>
                        </MyCheckbox>
                        <MyCheckbox
                            {...form4.register("agreePrivacy", {
                                required: ValidationErrors.required,
                            })}
                        >
                            Я согласен с{" "}
                            <MyA
                                style={{
                                    textDecoration: "underline",
                                    color: "var(--PRIMARY_WHITE)",
                                }}
                                href="https://disk.yandex.ru/i/cgcSSO2nW5AowA"
                            >
                                Политикой конфиденциальности
                            </MyA>
                        </MyCheckbox>
                        <MyCheckbox
                            {...form4.register("agreePersonalData", {
                                required: ValidationErrors.required,
                            })}
                        >
                            Я согласен с{" "}
                            <MyA
                                style={{
                                    textDecoration: "underline",
                                    color: "var(--PRIMARY_WHITE)",
                                }}
                                href="https://disk.yandex.ru/i/0Pk2pxJl4mJOmg"
                            >
                                Политикой обработки персональных данных
                            </MyA>
                        </MyCheckbox>
                    </div>
                </Carousel>
            </div>
            <div className={styles.Buttons + " buttons"}>
                {carouselPos === 0 && (
                    <Link to={ROUTES.LOGIN} className="ButtonDarkgray">
                        Уже есть аккаунт
                    </Link>
                )}
                {carouselPos !== 0 && (
                    <button
                        className="ButtonDarkgray"
                        onClick={() => carouselRef.current?.goBack()}
                    >
                        Назад
                    </button>
                )}

                {carouselPos !== maxPosition - 1 ? (
                    <button className="ButtonWhite" onClick={goForward}>
                        Далее
                    </button>
                ) : (
                    <button
                        disabled={isLoading || !form4.formState.isValid}
                        className="ButtonWhite"
                        onClick={submit}
                    >
                        {isLoading ? <Spinner /> : "Вперед!"}
                    </button>
                )}
            </div>
        </Skeleton>
    );
};
