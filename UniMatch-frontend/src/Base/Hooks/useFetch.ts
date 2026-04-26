import type { KyResponse, ResponsePromise } from "ky";
import { useState } from "react";

type FetchFunc<T extends object, R extends object> = (
    data: T
) => ResponsePromise<R>;

type FetchFuncRequest<T> = T extends FetchFunc<infer A, any> ? A : never;
type FetchFuncResponse<T> = T extends FetchFunc<any, infer A> ? A : never;

interface UseFetchOptions<T extends FetchFunc<any, any>> {
    fetchFunc: T;
    onSuccess?: (
        body: FetchFuncResponse<T>,
        res: KyResponse<FetchFuncResponse<T>>
    ) => void;
    onError?: (error: Error) => void;
}
// TODO: нет типизации параметров возвращаемой fetchData()
export const useFetch = <T extends FetchFunc<any, any>>({
    fetchFunc,
    onSuccess = () => {},
    onError = () => {},
}: UseFetchOptions<T>) => {
    const [error, setError] = useState("");
    const [response, setResponse] = useState<FetchFuncResponse<
        typeof fetchFunc
    > | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fetchData = async (
        data: FetchFuncRequest<typeof fetchFunc> | undefined = undefined
    ) => {
        setIsLoading(true);
        try {
            setError("");
            const res = await fetchFunc(data);
            const body = await res.json<FetchFuncResponse<typeof fetchFunc>>();
            setResponse(body);
            onSuccess(body, res);
            return body;
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
                setResponse(null);
                onError(error);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { fetchData, response, error, isLoading };
};
