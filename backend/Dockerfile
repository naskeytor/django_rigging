FROM python:3.11

RUN apt update && apt install -y \
    default-libmysqlclient-dev \
    build-essential \
    gcc \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY . /app/

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]