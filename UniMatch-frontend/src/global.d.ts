declare global {
    interface Window {
        ym: (...args: any[]) => void;
    }
}

export {};
