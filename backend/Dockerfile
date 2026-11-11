# ==============================================================================
# Backend iMDB Admin — PHP 8.3 + Apache
# API REST com autenticação JWT, sem dependências externas (composer não é
# necessário: o roteador, o JWT e as validações são implementados no projeto).
# ==============================================================================

FROM php:8.3-apache

# Extensão PDO MySQL
RUN docker-php-ext-install pdo_mysql

# VirtualHost: DocumentRoot em public/ (front controller) e .htaccess liberado
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

# PHP: erros apenas no log (nunca na resposta da API)
RUN { \
      echo 'display_errors=0'; \
      echo 'log_errors=1'; \
      echo 'error_log=/dev/stderr'; \
      echo 'date.timezone=America/Sao_Paulo'; \
    } > /usr/local/etc/php/conf.d/imdb.ini

# Código da aplicação
COPY . /var/www/html

EXPOSE 80
