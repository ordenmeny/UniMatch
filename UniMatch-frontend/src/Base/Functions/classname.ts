// format classes with conditions
export const classname = (
    ...classes: Array<Record<string, boolean> | string | undefined>
) => {
    let result = "";
    for (const cls of classes) {
        if (!cls) continue;
        if (typeof cls === "string") {
            result += cls + " ";
            continue;
        } else {
            for (const key in cls) {
                if (cls[key]) result += key + " ";
            }
        }
    }
    return result.trim();
};
