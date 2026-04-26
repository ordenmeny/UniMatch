import type { AnchorHTMLAttributes } from "react";

export const MyA = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    return (
        <a target="_blank" rel="noopener noreferrer" {...props}>
            {props.children}
        </a>
    );
};
