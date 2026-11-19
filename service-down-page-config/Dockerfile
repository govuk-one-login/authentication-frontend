FROM nginx/nginx-unprivileged:1.31.9-alpine@sha256:60214a103e6f38e953ff957f34b1f2e97a9db801ab2df3821da955d0fe6cadd6

COPY ./service-down/ /usr/share/nginx/html/
COPY ./nginx-fargate.conf /etc/nginx/conf.d/default.conf
