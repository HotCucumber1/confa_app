-- Создаем пользователя (если он ещё не существует)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'confa') THEN
    CREATE ROLE confa WITH LOGIN CREATEDB PASSWORD '12345Q';
  END IF;
END $$;

-- Создаем шаблонную базу данных
CREATE DATABASE indico_template WITH OWNER confa;

-- Подключаемся к шаблонной базе данных и создаем расширения
\c indico_template
CREATE EXTENSION unaccent;
CREATE EXTENSION pg_trgm;

-- Создаем основную базу данных на основе шаблона
CREATE DATABASE indico WITH TEMPLATE indico_template OWNER confa;
