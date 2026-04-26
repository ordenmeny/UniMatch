class SuppressBrowserAuthMiddleware:
    """
    Middleware для удаления заголовка WWW-Authenticate из ответов 401,
    чтобы предотвратить появление диалога аутентификации браузера
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Если ответ 401 и есть заголовок WWW-Authenticate
        if response.status_code == 401 and 'WWW-Authenticate' in response:
            # Удаляем заголовок
            del response['WWW-Authenticate']

        return response
