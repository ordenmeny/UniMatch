import type { HTMLAttributes } from "react";
import styles from "./styles.module.scss";

interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
    color?: string;
    size?: string;
    center?: boolean;
}

export const Spinner = ({ color, size, center, className='', ...props }: SpinnerProps) => {
    return (
        <span
            style={{
                margin: center ? "0 auto" : "",
                display: center ? "block" : "",
                borderColor: color || "",
                width: size || "",
                height: size || "",
            }}
            className={styles.Spinner + ' ' + className}
            {...props}
        ></span>
    );
};
