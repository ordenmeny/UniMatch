import type { HTMLAttributes } from "react";
import styles from "./styles.module.scss";
import { classname } from "@/Base/Functions/classname";

interface BurgerButtonProps extends HTMLAttributes<HTMLDivElement> {
    isActive: boolean;
    className?: string;
}

export const BurgerButton = (props: BurgerButtonProps) => {
    const { className, isActive, ...otherProps } = props;
    return (
        <div
            className={classname(className, styles.BurgerButton, {
                [styles.Active]: isActive,
            })}
            {...otherProps}
        ></div>
    );
};
