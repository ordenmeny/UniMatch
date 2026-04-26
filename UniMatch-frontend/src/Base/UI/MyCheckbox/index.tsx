import styles from "./styles.module.scss";

import { type InputHTMLAttributes } from "react";

interface MyCheckboxI extends InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string;
    type?: "checkbox";
}

// https://css-tricks.com/custom-styling-form-inputs-with-modern-css-features/
export const MyCheckbox = ({
    containerClassName = "",
    children = "",
    type = "checkbox",
    ...props
}: MyCheckboxI) => {
    return (
        <label className={styles.Checkbox + " checkbox " + containerClassName}>
            <input type={type} {...props} />
            {children}
            {/* <label htmlFor={id}>{children}</label> */}
        </label>
    );
};
