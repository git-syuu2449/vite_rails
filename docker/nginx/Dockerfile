FROM nginx:alpine

RUN apk add --no-cache \
    bash \
    curl \
    bind-tools

CMD ["nginx", "-g", "daemon off;"]
