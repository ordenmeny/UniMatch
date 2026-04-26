import { Spinner } from "@/Base/UI/Spinner";
import type { HTMLAttributes, InputHTMLAttributes } from "react";
import type { TagT } from "../../types";
import styles from "./styles.module.scss";

interface TagSelectorProps extends HTMLAttributes<HTMLDivElement> {
    tags: TagT[] | null;
    propsToInput?: InputHTMLAttributes<HTMLInputElement>;
    checkedInputs?: TagT[];
}

export const TagSelector = ({
    tags = null,
    propsToInput = {},
    checkedInputs = [],
    className,
    ...props
}: TagSelectorProps) => {
    let sortedTags = tags;
    if (tags && checkedInputs) {
        // сначала пойдут те теги, которые выбраны у пользователя, потом остальные
        sortedTags = tags.sort((tag) =>
            checkedInputs.findIndex(
                (checkedTag) => tag.id === checkedTag.id
            ) === -1
                ? 1
                : -1
        );
    }

    return (
        <div
            // style={{ gridTemplateColumns: "1fr 1fr" }}
            className={styles.TagSelector + " " + className}
            {...props}
        >
            {sortedTags ? (
                sortedTags.map((tag) => (
                    <label key={tag.id}>
                        <input
                            defaultChecked={
                                !!checkedInputs.find(
                                    (checkedTag) => checkedTag.id === tag.id
                                )
                            }
                            type="checkbox"
                            value={tag.id}
                            {...propsToInput}
                        />
                        {tag.name}
                    </label>
                ))
            ) : (
                <Spinner size="var(--fz-h2)" center={true} />
            )}
            {tags && tags.length === 0 && <p>Тегов нет .-.</p>}
        </div>
    );
};
