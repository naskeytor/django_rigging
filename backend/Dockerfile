# Usar una imagen de Python con soporte para MySQL
FROM python:3.11

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias
RUN pip install --no-cache-dir django mysqlclient gunicorn

# Comando de inicio
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
