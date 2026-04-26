import { useFetch } from "@/Base/Hooks/useFetch";
import { Spinner } from "@/Base/UI/Spinner";
import { TagSelector } from "@/Modules/Tag/UI/TagSelector";
import { useEffect, type ComponentProps } from "react";
import { fetchUserAndTotalTags } from "../../Functions/fetchUserAndTotalTags";
import styles from "./styles.module.scss";
import { Error } from "@/Base/UI/Error";
export const UserTagSelector = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tags,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    checkedInputs,
    error = "",
    ...props
}: Partial<ComponentProps<typeof TagSelector>> & { error?: string }) => {
    const fetchedTags = useFetch({
        fetchFunc: fetchUserAndTotalTags,
    });
    useEffect(() => {
        fetchedTags.fetchData();
    }, []);
    return (
        <div className={styles.UserTagSelector}>
            {error && <Error>{error}</Error>}
            {fetchedTags.isLoading ? (
                <Spinner center={true} />
            ) : (
                <TagSelector
                    tags={fetchedTags.response?.all_tags || null}
                    checkedInputs={fetchedTags.response?.user_tags}
                    {...props}
                />
            )}
        </div>
    );
};
