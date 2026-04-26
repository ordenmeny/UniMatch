import type { HTMLAttributes } from "react";
import styles from "./styles.module.scss";
export const Error = ({
    children,
    fzMul = 1,
    ...props
}: HTMLAttributes<HTMLParagraphElement> & {
    children: string;
    fzMul?: number;
}) => {
    return (
        <p
            className={styles.Error}
            style={{ fontSize: `calc(var(--fz-p)*${fzMul})` }}
            {...props}
        >
            {children}
        </p>
    );
};
