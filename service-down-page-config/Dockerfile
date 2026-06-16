FROM nginxinc/nginx-unprivileged:1.27.4-alpine@sha256:2211200bb46431bb70f044f83cd989901205ce3232e1c431822876f1fd166689

COPY ./service-down/ /usr/share/nginx/html/
COPY ./nginx-fargate.conf /etc/nginx/conf.d/default.conf
