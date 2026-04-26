import type { HTMLAttributes } from "react";
import styles from "./styles.module.scss";

interface CarouselIndicator extends HTMLAttributes<HTMLDivElement> {
    position: number;
    maxPosition: number;
}

export const CarouselIndicator = ({
    position,
    maxPosition,
    className,
    ...props
}: CarouselIndicator) => {
    return (
        <div className={styles.CarouselIndicator + " " + className} {...props}>
            {[...Array(maxPosition).keys()].map((thisPosition, index) => (
                <div
                    key={index}
                    className={thisPosition <= position ? styles.Filled : ""}
                ></div>
            ))}
        </div>
    );
};
