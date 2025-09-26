# ---- Frontend на 80 порту ----
server {
    listen 80;
    charset utf-8;

    # React build из /vol/static/frontend
    root /vol/static/frontend;
    index index.html;

    # SPA: если файл не найден – отдаём index.html
    location / {
        try_files $uri /index.html;
    }
}

# ---- Backend на 8000 порту ----

server {
    # the port your site will be served on (8000)
    listen ${LISTEN_PORT};

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
