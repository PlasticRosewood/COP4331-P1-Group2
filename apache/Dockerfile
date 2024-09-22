FROM bitnami/phpmyadmin:latest

#installs composer
COPY --from=composer:latest /composer /usr/local/bin/composer

USER root

RUN composer require firebase/php-jwt

USER 1001

