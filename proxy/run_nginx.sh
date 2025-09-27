#!/bin/sh

# Это гарантирует, что скрипт выйдет, если какая-либо последующая команда завершится ошибкой.
set -e

# envsubst < шаблон > файл, построенный по шаблону.
# Результат записывается в новый файл /etc/nginx/conf.d/default.conf,
# перезаписывая его.
envsubst '${APP_HOST} ${APP_PORT}' < /etc/nginx/default.conf.tpl > /etc/nginx/conf.d/default.conf
nginx -g "daemon off;"
