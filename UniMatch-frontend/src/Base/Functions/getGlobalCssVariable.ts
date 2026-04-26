export const getGlobalCssVariable = (variableName: string) => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);  
    const value = computedStyle.getPropertyValue('--' + variableName);
    return value.trim();
}