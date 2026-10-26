FROM nginx/nginx-unprivileged:1.30-alpine@sha256:2daef144b574804198caccc4041819fa1801ecd5df2252a39646bfa2b1ff3bea

COPY ./service-down/ /usr/share/nginx/html/
COPY ./nginx-fargate.conf /etc/nginx/conf.d/default.conf
