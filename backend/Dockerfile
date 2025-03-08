# Usa una imagen oficial de Python
FROM python:3.11

# Instalar dependencias del sistema necesarias para MySQL
RUN apt update && apt install -y \
    default-libmysqlclient-dev \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos del proyecto al contenedor
COPY . /app/

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Exponer el puerto en el que corre Django
EXPOSE 8000

# Comando para iniciar Django
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
