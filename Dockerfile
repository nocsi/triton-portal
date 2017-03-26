FROM nginx:latest
ADD conf/cert/ /etc/nginx/cert/
ADD conf/nginx.conf /etc/nginx/nginx.conf
COPY site /_site/
CMD ["nginx", "-g", "daemon off;"]
