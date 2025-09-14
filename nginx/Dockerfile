FROM nginx:latest

# Create the nginx user and group if they don't exist
RUN if ! getent group nginx; then \
    groupadd -r -g 999 nginx; \
    fi

# Create the nginx user if it doesn't exist
RUN if ! getent passwd nginx; then \
    useradd -r -u 999 -g nginx -d /var/cache/nginx -s /sbin/nologin -c "nginx user" nginx; \
    fi

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]