# Зона для ограничения общих запросов (GET, HEAD)
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=10r/s;

# Зона для методов изменения данных
limit_req_zone $binary_remote_addr zone=write_limit:10m rate=5r/s;

# Зона для ограничения соединений
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;


server {
    listen 80;
    server_name uni-match.ru www.uni-match.ru;

    # --- FRONTEND (React build) ---
    root   /usr/share/nginx/html;
    index  index.html;

    location / {
        limit_req zone=general_limit burst=20 nodelay;
        try_files $uri /index.html;
    }
}


server {
    listen 8000;
    server_name uni-match.ru www.uni-match.ru;

    charset utf-8;

    # Таймауты
    client_body_timeout 10s;
    client_header_timeout 10s;
    send_timeout 10s;

    # Буферы
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;

    # Ограничение соединений
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

    # Django (uWSGI)
    location / {
        limit_req zone=general_limit burst=20 nodelay;
        limit_req zone=write_limit burst=10 nodelay;

        uwsgi_pass ${APP_HOST}:${APP_PORT};
        include /etc/nginx/uwsgi_params;

        client_max_body_size 40M;

        uwsgi_read_timeout 60s;
        uwsgi_send_timeout 60s;
    }
}