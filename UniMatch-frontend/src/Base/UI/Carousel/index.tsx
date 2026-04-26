import {
    Children,
    cloneElement,
    forwardRef,
    useImperativeHandle,
    useRef,
    type HTMLAttributes,
    type ReactElement,
} from "react";
import styles from "./styles.module.scss";

interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
    position: number;
    setPosition: React.Dispatch<React.SetStateAction<number>>;
    tapeClassname?: string;
    children: Array<ReactElement<HTMLDivElement>>;
    onPageScroll?: (
        pastPosition: number,
        pastPageElement: Element
    ) => boolean | void;
}

export interface CarouselRef {
    goForward: () => void;
    goBack: () => void;
    goPos: (pos: number) => void;
}

export const Carousel = forwardRef<CarouselRef, CarouselProps>(
    (
        {
            position,
            setPosition,
            className = "",
            tapeClassname = "",
            children,
            onPageScroll = () => {},
            ...props
        },
        ref
    ) => {
        const tapeRef = useRef<HTMLDivElement>(null);
        const acceptNewPosition = (
            oldPos: number,
            newPos: number,
            condition: boolean
        ) => {
            if (condition) {
                const pageElem = tapeRef.current?.children.item(oldPos);
                if (pageElem) onPageScroll(oldPos, pageElem);
                return newPos;
            } else {
                return oldPos;
            }
        };
        const newChildren = Children.map(children, (child, index) => {
            if (index === position) return child;
            return cloneElement(child, {
                inert: true,
            });
        });

        useImperativeHandle(ref, () => ({
            goForward: () =>
                setPosition((pos) => {
                    const newPos = pos + 1;
                    return acceptNewPosition(
                        pos,
                        newPos,
                        newPos < Children.count(children)
                    );
                }),

            goBack: () =>
                setPosition((pos) => {
                    const newPos = pos - 1;
                    return acceptNewPosition(pos, newPos, newPos >= 0);
                }),
            goPos: (newPos) =>
                setPosition((curPos) => {
                    return acceptNewPosition(
                        curPos,
                        newPos,
                        newPos >= 0 && newPos < Children.count(children)
                    );
                }),
        }));

        return (
            <div className={styles.Carousel + " " + className} {...props}>
                <div
                    ref={tapeRef}
                    style={{ left: -100 * position + "%" }}
                    className={styles.Tape + " " + tapeClassname}
                >
                    {newChildren}
                </div>
            </div>
        );
    }
);
