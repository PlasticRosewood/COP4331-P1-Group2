# Use the official PHP Apache image as the base
FROM php:8.1-apache

# Enable the rewrite module
RUN a2enmod rewrite

RUN docker-php-ext-install pdo pdo_mysql

# Get 7zip for composer
RUN apt-get update && apt-get install -y p7zip-full
RUN rm -rf /var/lib/apt/lists/*

# Get composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer


