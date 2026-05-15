-- 적용 시점: passes 기반 흐름 E2E 검증 완료 + 스크린샷 캡처 완료 후
-- 적용 방법: MCP `apply_migration` 또는 Supabase SQL Editor
-- 롤백 시: passes_system 마이그레이션의 백필 로직을 역방향으로 재실행해야 하므로 사전에 백업 권장
--   pg_dump --schema=public --table=points --table=point_transactions

DROP FUNCTION IF EXISTS public.charge_points(uuid, integer, text, text);
DROP FUNCTION IF EXISTS public.spend_points(uuid, integer);
DROP TABLE IF EXISTS public.point_transactions;
DROP TABLE IF EXISTS public.points;
