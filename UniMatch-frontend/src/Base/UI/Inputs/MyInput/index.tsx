import { Error } from "../../Error";
import styles from "./styles.module.scss";

import type { InputHTMLAttributes } from "react";

interface MyInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    type?: Exclude<
        InputHTMLAttributes<HTMLInputElement>["type"],
        "checkbox" | "date" | "datetime-local" | "month" | "time" | "week"
    >;
}

export const MyInput = ({ error, className, ...props }: MyInputProps) => {
    return (
        <label className={styles.MyLabel + " input " + className}>
            {error && <Error fzMul={0.73}>{error}</Error>}
            <input className={styles.MyInput} {...props} />
        </label>
    );
};
