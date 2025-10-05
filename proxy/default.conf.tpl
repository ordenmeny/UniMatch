server {
    listen 80;
    server_name unimatch.ru www.unimatch.ru;

    # Все запросы на 80 → переадресация на https
    location / {
        return 301 https://$host$request_uri;
    }
}


server {
    listen 443 ssl;
    server_name unimatch.ru www.unimatch.ru;

    ssl_certificate /etc/letsencrypt/live/unimatch.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/unimatch.ru/privkey.pem;

    # --- FRONTEND (React build) ---
    root   /usr/share/nginx/html;
    index  index.html;

    location / {
        try_files $uri /index.html;
    }

    # --- FRONTEND ---
    #location / {
    #    proxy_pass http://frontend-app:5173/;
    #    proxy_http_version 1.1;
    #    proxy_set_header Upgrade $http_upgrade;
    #    proxy_set_header Host $host;
    #    proxy_cache_bypass $http_upgrade;
    #}
}


server {
    listen 8000 ssl;
    server_name unimatch.ru www.unimatch.ru;

    ssl_certificate /etc/letsencrypt/live/unimatch.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/unimatch.ru/privkey.pem;

    charset     utf-8;

    # Django media and static
    location /media/  {
        alias /vol/media/;
    }

    location /static/ {
        alias /vol/static/;
    }

    # Send all non-media requests to the Django server.
    # 0.0.0.1:9000
    location / {
        uwsgi_pass          ${APP_HOST}:${APP_PORT};
        include             /etc/nginx/uwsgi_params;
        client_max_body_size 40M;
    }
}
