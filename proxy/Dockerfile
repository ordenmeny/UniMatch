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


CMD ["/run_nginx.sh"]
