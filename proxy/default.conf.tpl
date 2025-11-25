# Зона для ограничения общих запросов (GET, HEAD) - 10 МБ = ~160К IP
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=10r/s;

# Зона для ограничения методов изменения данных (POST, PUT, PATCH, DELETE)
limit_req_zone $binary_remote_addr zone=write_limit:10m rate=5r/s;

# Зона для ограничения по соединениям (защита от slowloris)
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;


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

    # Таймауты для защиты от медленных запросов
    client_body_timeout 10s;
    client_header_timeout 10s;
    send_timeout 10s;
    
    # Ограничение размера буферов (защита от переполнения)
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;

    # Ограничение одновременных соединений с одного IP
    limit_conn conn_limit 10;
    
    # Код ответа при превышении лимитов
    limit_req_status 429;

    # --- FRONTEND (React build) ---
    root   /usr/share/nginx/html;
    index  index.html;

    location / {
        limit_req zone=general_limit burst=20 nodelay;

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

    # Таймауты для защиты от медленных запросов
    client_body_timeout 10s;
    client_header_timeout 10s;
    send_timeout 10s;
    
    # Ограничение размера буферов
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;

    # Ограничение одновременных соединений с одного IP
    limit_conn conn_limit 10;
    
    # Код ответа при превышении лимитов
    limit_req_status 429;

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
        # Общее ограничение для всех запросов
        limit_req zone=general_limit burst=20 nodelay;
        
        # Дополнительное жесткое ограничение для POST/PUT/PATCH/DELETE: 5 req/s
        limit_req zone=write_limit burst=10 nodelay;

        uwsgi_pass          ${APP_HOST}:${APP_PORT};
        include             /etc/nginx/uwsgi_params;
        client_max_body_size 40M;

        # Таймауты для uwsgi
        uwsgi_read_timeout 60s;
        uwsgi_send_timeout 60s;
    }
}
