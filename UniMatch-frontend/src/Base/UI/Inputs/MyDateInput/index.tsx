import { classname } from "@/Base/Functions/classname";
import styles from "./styles.module.scss";

import { useState, type InputHTMLAttributes } from "react";
import { Error } from "../../Error";

interface MyDateInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    type?: "date" | "datetime-local" | "month" | "time" | "week";
}

// required стоит для нормальной работы цветов дейтпикеров (type="date")
// без атрибута начальное значение дд.мм.гггг имеет неправильный цвет
export const MyDateInput = ({
    error,
    className,
    type = "date",
    placeholder,
    defaultValue = "",
    onChange = () => {},
    ...props
}: MyDateInputProps) => {
    const [value, setValue] = useState(defaultValue);
    return (
        <label className={classname(styles.Label, "input", className)}>
            {error && <Error fzMul={0.73}>{error}</Error>}
            <span
                className={styles.Placeholder}
                style={value ? { display: "none" } : {}}
            >
                {placeholder}
            </span>
            <input
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    onChange(e);
                }}
                type={type}
                style={value ? { color: "var(--PRIMARY_WHITE)" } : {}}
                className={styles.Input}
                {...props}
            />
        </label>
    );
};
