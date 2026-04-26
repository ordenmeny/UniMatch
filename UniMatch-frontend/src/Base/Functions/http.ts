import { saveToken } from "@/Modules/User/Functions/saveToken";
import ky from "ky";
import { LocalStorage } from "../Variables/localstorage";
import { ROUTES } from "@/Main/App/MyRouter";

export interface ErrorResponse {
    error: string;
}

export type Response<T> = T | ErrorResponse;

export const http = ky.create({
    prefixUrl: import.meta.env.VITE_BACKEND_URL,
    timeout: 10000,
    retry: 3,
    credentials: "include",
    hooks: {
        beforeRequest: [
            (request) => {
                const token = localStorage.getItem(LocalStorage.TOKEN);
                if (token) request.headers.set("Authorization", token);
            },
        ],
        afterResponse: [
            async (request, _options, response) => {
                // если access устарел
                if (response.status === 401) {
                    const res = await ky.post<{ access: string }>(
                        "api/token/refresh/",
                        {
                            prefixUrl: import.meta.env.VITE_BACKEND_URL,
                            retry: 5,
                            credentials: "include",
                            hooks: {
                                afterResponse: [
                                    async (_req, _opt, response) => {
                                        // если рефреш устарел
                                        if (response.status === 401) {
                                            window.location.replace(
                                                ROUTES.LOGIN
                                            );
                                            localStorage.removeItem(
                                                LocalStorage.TOKEN
                                            );
                                            return new Response(
                                                "Redirect to login-page",
                                                { status: 200 }
                                            );
                                        }
                                    },
                                ],
                            },
                        }
                    );
                    const token = await res.json();
                    saveToken(token.access);
                    // попробовать еще раз со свежим токеном
                    return http(request);
                }
            },
        ],
        beforeError: [
            async (error) => {
                const response = await error.response.json<ErrorResponse>();
                if (response.error) error.message = response.error;
                return error;
            },
        ],
    },
});
