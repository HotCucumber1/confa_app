# syntax=docker/dockerfile:1

FROM python:3.12.2
WORKDIR /app
COPY requirements.txt ./
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libxml2-dev \
    libxslt1-dev \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 3000
CMD ["indico", "run", "-h", "0.0.0.0", "-p", "8000"]


#FROM harbor.ispring.lan/vendor/node:21.6.1-bookworm-slim
#
#WORKDIR /packages
#
#COPY [".", "."]
#
#RUN corepack enable && corepack prepare yarn@stable --activate
#
#COPY ./docker-entrypoint.sh /docker-entrypoint.sh
#
#RUN chmod +x /docker-entrypoint.sh
#ENTRYPOINT ["/docker-entrypoint.sh"]
