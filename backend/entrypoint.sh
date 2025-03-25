#!/bin/sh

echo "🔄 Esperando a que la base de datos esté lista..."

# Espera hasta que el puerto 3306 del contenedor db_django esté disponible
while ! nc -z db_django 3306; do
  sleep 1
done

echo "✅ Base de datos disponible. Aplicando migraciones..."
python manage.py migrate

echo "🚀 Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000