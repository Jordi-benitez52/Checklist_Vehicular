from django.http import HttpResponse

class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Content Security Policy (CSP)
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://cdn.jsdelivr.net; "
            "connect-src 'self' https://*.railway.app https://*.vercel.app https://cdn.jsdelivr.net; "
            "frame-ancestors 'none';"
        )
        response['Content-Security-Policy'] = csp_policy

        # Ngrok browser warning bypass
        response['ngrok-skip-browser-warning'] = 'true'

        # Remove server version disclosure
        if 'Server' in response:
            del response['Server']

        return response