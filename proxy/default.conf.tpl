server {
    listen 80;
    server_name uni-match.ru www.uni-match.ru;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name uni-match.ru www.uni-match.ru;

    ssl_certificate /etc/letsencrypt/live/uni-match.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/uni-match.ru/privkey.pem;

    root /usr/share/nginx/html;

    location / {
        try_files $uri /index.html;
    }
}