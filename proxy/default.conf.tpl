# Зона для ограничения общих запросов (GET, HEAD)
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=10r/s;

# Зона для методов изменения данных
limit_req_zone $binary_remote_addr zone=write_limit:10m rate=5r/s;

# Зона для ограничения соединений
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;


server {
    listen 80;
    server_name uni-match.ru www.uni-match.ru;

    # 👇 ВОТ ЭТО ДОБАВЬ (КРИТИЧНО)
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
        try_files $uri =404;
    }

    # --- FRONTEND (React build) ---
    root   /usr/share/nginx/html;
    index  index.html;

    location / {
        limit_req zone=general_limit burst=20 nodelay;
        try_files $uri /index.html;
    }
}