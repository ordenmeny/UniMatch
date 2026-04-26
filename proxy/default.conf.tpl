# лимиты можно оставить — они не мешают
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=write_limit:10m rate=5r/s;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

server {
    listen 80;
    server_name unimatch.ru www.unimatch.ru;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        limit_req zone=general_limit burst=20 nodelay;
        try_files $uri /index.html;
    }
}