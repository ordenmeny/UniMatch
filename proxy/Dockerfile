FROM nginx

COPY ./default.conf.tpl /etc/nginx/default.conf.tpl
COPY ./uwsgi_params /etc/nginx/uwsgi_params
COPY ./run_nginx.sh /run_nginx.sh

ENV LISTEN_PORT=8000
ENV APP_HOST=app
ENV APP_PORT=9000

RUN mkdir -p /vol/static && \
    mkdir -p /vol/static/frontend && \
    mkdir -p /vol/media && \
    chmod +x /run_nginx.sh


# CMD envsubst '\$http_upgrade \$host \$http_upgrade' < /etc/nginx/default.conf.tpl > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'
CMD ["/run_nginx.sh"]
