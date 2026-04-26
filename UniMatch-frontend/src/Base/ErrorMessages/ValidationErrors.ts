export const ValidationErrors = {
    required: "Поле не может быть пустым",
    email: "Неправильный формат Email",
    password:
        "Пароль должен состоять из минимум 4 символов",
    badFormat: (format?: string) =>
        `Неправильный формат${format ? " " + format : ""}`,
    minLength: (minLength: number) =>
        `Минимальная длина: ${minLength} символов`,
    maxLength: (maxLength: number) =>
        `Максимальная длина: ${maxLength} символов`,
    allowedSymbols: (allowedSymbols: string) =>
        `Разрешенные символы: ${allowedSymbols}`,
    min: (min: number) => `Минимум: ${min}`,
    max: (max: number) => `Максимум: ${max}`,
};
