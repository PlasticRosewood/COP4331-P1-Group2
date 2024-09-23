cp -n .env.example .env
docker system prune -a -f
docker compose up -d && docker-compose exec -it apache bash -c "composer install && chown -R www-data:www-data /var/www/html/vendor"