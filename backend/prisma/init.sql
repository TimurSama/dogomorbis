-- Инициализация базы данных Dogymorbis
-- Этот файл выполняется при первом запуске PostgreSQL контейнера

-- Создаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Создаем индексы для оптимизации поиска
-- (Prisma создаст таблицы, но мы можем добавить дополнительные индексы)

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем функцию для генерации случайных строк
CREATE OR REPLACE FUNCTION generate_random_string(length INTEGER)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, (random() * length(chars))::INTEGER + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для расчета расстояния между двумя точками
CREATE OR REPLACE FUNCTION calculate_distance(lat1 FLOAT, lng1 FLOAT, lat2 FLOAT, lng2 FLOAT)
RETURNS FLOAT AS $$
DECLARE
    R FLOAT := 6371000; -- радиус Земли в метрах
    dLat FLOAT;
    dLng FLOAT;
    a FLOAT;
    c FLOAT;
BEGIN
    dLat := radians(lat2 - lat1);
    dLng := radians(lng2 - lng1);
    a := sin(dLat/2) * sin(dLat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLng/2) * sin(dLng/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Создаем представление для статистики пользователей
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.created_at,
    l.level,
    l.tier,
    l.experience,
    COUNT(DISTINCT p.id) as posts_count,
    COUNT(DISTINCT c.id) as comments_count,
    COUNT(DISTINCT li.id) as likes_received,
    COUNT(DISTINCT do.id) as dogs_count,
    COUNT(DISTINCT je.id) as journal_entries_count,
    COUNT(DISTINCT cc.id) as bones_collected
FROM users u
LEFT JOIN levels l ON u.id = l.user_id
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN likes li ON p.id = li.post_id
LEFT JOIN dog_ownerships do ON u.id = do.user_id
LEFT JOIN journal_entries je ON u.id = je.user_id
LEFT JOIN collectible_collections cc ON u.id = cc.user_id
GROUP BY u.id, l.level, l.tier, l.experience;

-- Создаем представление для активных косточек
CREATE OR REPLACE VIEW active_bones AS
SELECT 
    cs.*,
    ST_GeogFromText('POINT(' || (cs.location::json->>'lng')::float || ' ' || (cs.location::json->>'lat')::float || ')') as geom
FROM collectible_spawns cs
WHERE cs.is_active = true 
AND (cs.expires_at IS NULL OR cs.expires_at > NOW());

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_collectible_spawns_location ON collectible_spawns USING GIST (
    ST_GeogFromText('POINT(' || (location::json->>'lng')::float || ' ' || (location::json->>'lat')::float || ')')
);
CREATE INDEX IF NOT EXISTS idx_collectible_spawns_active ON collectible_spawns(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);

-- Создаем триггеры для автоматического обновления updated_at
-- (Эти триггеры будут созданы после создания таблиц Prisma)

-- Настраиваем логирование
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Перезагружаем конфигурацию
SELECT pg_reload_conf();

-- Выводим информацию о созданной базе
DO $$
BEGIN
    RAISE NOTICE 'База данных Dogymorbis инициализирована успешно!';
    RAISE NOTICE 'Созданы расширения: uuid-ossp, pg_trgm';
    RAISE NOTICE 'Созданы функции: update_updated_at_column, generate_random_string, calculate_distance';
    RAISE NOTICE 'Созданы представления: user_stats, active_bones';
    RAISE NOTICE 'Созданы индексы для оптимизации производительности';
END $$;
