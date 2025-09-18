FROM nginx:latest

# Заменяем стандартный конфигурационный файл на наш,
# так как наш файл является полной конфигурацией, а не частичной.
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]