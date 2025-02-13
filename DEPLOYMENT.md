# Инструкция по локальному развертыванию `indico`
## 1. Установить необходимые зависимости
```bash
# различные библиотеки, redis, postgres, sqlite
sudo apt update

sudo apt install -y --install-recommends libxslt1-dev libxml2-dev \
    libyaml-dev build-essential redis-server postgresql libpq-dev \
    libpango1.0-dev libffi-dev libpcre3-dev libsqlite3-dev \
    postgresql-client-common
```
```bash
sudo apt install -y libjpeg-turbo8-dev zlib1g-dev
```

## 2. Установить `pyenv` (менеджер версий питона)
1. Установить `pyenv`
```bash
# установить необходимые зависимости
sudo apt install -y make build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
    libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev \
    liblzma-dev python3-openssl git
```

```bash
# установить pyenv
curl https://pyenv.run | bash
```

2. Настроить `pyenv` локально
```bash
# открыть .bashrc
sudo nano ~/.bashrc

# дописать нижеприведенные строки в .bashrc
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

# применить изменения
source ~/.bashrc
```

3. Проверить, что `pyenv` работает
```bash
pyenv --version
```

## 3. Установить Python >= 3.12.2 (можно и любой другой патч 3.12.*, но стабильность не гарантирую)
В целом, проект должен работать на версиях от 3.12.2 до 3.13
```bash
# установить python
pyenv install 3.12.2
pyenv global 3.12.2
```

```bash
# удостовериться, что python работает
python --version  # Python 3.12.2
```

## 4. Собрать виртуальное окружение проекта
```bash
# перейти в дирректорию проекта
cd </path/to/my/projects/confa_app>

pyenv local 3.12
python -m venv .venv
```

## 5. Собрать виртуальное окружение для maildump
```bash
# перейти в дирректорию проекта
cd </path/to/my/projects/confa_app>

python -m venv maildump
./maildump/bin/pip install -U pip setuptools wheel
./maildump/bin/pip install maildump
./maildump/bin/maildump -p /tmp/maildump.pid
```

## 6. Собрать Базу Данных PostgresSQL
```bash
sudo -u postgres createuser $USER --createdb
sudo -u postgres createdb indico_template -O $USER
sudo -u postgres psql indico_template -c "CREATE EXTENSION unaccent; CREATE EXTENSION pg_trgm;"
createdb indico -T indico_template
```

## 7. Собрать конфигурацию Indico
```bash
# перейти в дирректорию проекта
cd </path/to/my/projects/confa_app>

source .venv/bin/activate
pip install -r requirements.txt
pip install -U pip setuptools wheel
pip install -e '.[dev]'
npm ci
```

## 8. Запустить сборку сервера для Indico
На этом этапе будет предложена инструкция по сборке. На всех этапах можно оставить дефолтные данные, предложенные wizard-ом
```bash
indico setup wizard --dev
```

Пример дефолтных настроек V
<details>

```bash
Indico root path: /projects
Indico URL: http://127.0.0.1:8000
PostgreSQL database URI: postgresql:///indico
Redis URI (celery): redis://127.0.0.1:6379/0
Redis URI (cache): redis://127.0.0.1:6379/1
Contact email: its_a_test@mail.ru
Admin email: its_a_test@mail.ru
No-reply email: noreply@mail.ru
SMTP host: 127.0.0.1
SMTP port: 1025
SMTP username: dmitriy
SMTP password: ************
Keep these settings anyway? [y/N]: y
Default locale: en_US
Default timezone: Europe/Moscow
Enable room booking? [y/N]: y
Enable system notices? [Y/n]: y
```
</details>

## 9. Инициализировать базу данных
```bash
indico db prepare
```

## 10. Собрать локализации
На этом этапе может выпасть много ошибок, но это норма, просто забейте
```bash
indico i18n compile indico
```

## 11. Запустить сервер
На этом этапе понадобится открыть два терминала
1. `Терминал 1` Запуск webpack watcher, который компилирует ресурсы JavaScript и стили при каждом их изменении
```bash
./bin/maintenance/build-assets.py indico --dev --watch
```
2. `Терминал 2` Запуск сервера

Если на этапе сборки `wizard` был указан не `localhost` или `127.0.0.1`, то вместо localhost надо указать свой адрес
```bash
indico run -h localhost -q --enable-evalex
```
