server {
    listen 80;

    charset utf-8;

    location / {
        proxy_pass http://frontend-app:5173/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}


server {
    # the port your site will be served on (8000)
    listen 8000;

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
