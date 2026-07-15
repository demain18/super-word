<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:supabase-db-rules -->
# Supabase DB 작업 규칙 (반드시 준수)

이 프로젝트는 실서비스 유저 데이터가 든 Supabase 프로젝트에 연결돼 있다. DB 작업은 아래 규칙을 반드시 따른다.

## 1. 실행 전 무조건 계획 보여주고 승인받기
- `apply_migration`(스키마 변경)이나 `execute_sql`(데이터 변경)을 실행하기 전에, 실행할 SQL 전문을 먼저 사용자에게 보여주고 명시적 승인을 받는다.
- 사용자가 "실행해"라고 확인하기 전에는 절대 실행하지 않는다.

## 2. 파괴적 작업 금지 (사용자가 명시적으로 허락하기 전까지)
다음은 사용자의 명확한 지시 없이는 절대 실행하지 않는다:
- `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`
- 컬럼 `RENAME`
- 기존 컬럼에 `NOT NULL` 제약 추가, 컬럼 타입 변경(`ALTER COLUMN ... TYPE`)
- `DELETE` / `UPDATE` 로 대량 행 변경·삭제

## 3. 안 쓰는 컬럼·테이블은 지우지 말 것
- 정리가 필요해 보여도 삭제하지 않는다. "이건 안 쓰는 것 같다"고 알려만 주고, 삭제 여부는 사용자가 결정한다.
- 스키마 변경은 기본적으로 "추가(additive)"만 한다: 새 컬럼 추가, 새 테이블 추가는 OK. 기존 구조 변경은 먼저 물어본다.

## 4. 파괴적 변경 전 경고 + 백업 안내
- 데이터가 지워지거나 실서비스 데이터 때문에 실패할 가능성이 있으면 실행 전에 반드시 경고한다.
- 되돌릴 수 없는 변경 전에는 사용자에게 백업/스냅샷을 먼저 뜨라고 안내한다.

## 5. 실서비스에 바로 하지 말 것
- 스키마 변경은 가능하면 Supabase 브랜치나 별도 staging 프로젝트에서 먼저 검증한 뒤 반영한다.
<!-- END:supabase-db-rules -->
