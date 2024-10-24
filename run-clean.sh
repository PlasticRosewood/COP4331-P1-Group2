cp -n .env.example .env
docker compose down && docker compose up -d --build && docker-compose exec -it apache bash -c "composer install && chown -R www-data:www-data /var/www/html/vendor"