# Supabase 방명록 설정

## 연결 순서

1. Supabase 프로젝트의 SQL Editor에서 `supabase/guestbook.sql`을 실행합니다.
2. `config/app.config.js`에 다음 공개 설정을 입력합니다:
   - guestbookProvider: "supabase"
   - supabaseUrl: "https://프로젝트ID.supabase.co"
   - supabasePublishableKey: 프로젝트의 publishable 키(또는 legacy anon 키)
   - guestbookWeddingId: "default"
3. `config/wedding.config.js`의 guestbook.visible을 true로 설정합니다(현재 기본 true).
4. 로컬 서버 또는 GitHub Pages에서 등록·조회합니다. 별도 Node 서버나 번들 설치 없이 HTTPS REST API를 호출합니다.
5. SQL Editor에서 `supabase/guestbook-test.sql`을 실행해 실제 DB의 중복·권한·승인 동작을 확인합니다. 테스트 데이터는 롤백됩니다.

브라우저 설정에는 service_role, sb_secret 키, DB 비밀번호를 넣지 않습니다.
키 미설정 시 안내를 표시하고 입력·등록을 비활성화합니다. 현재 제공된 코드에는 실제 프로젝트 자격 증명이 없습니다.

## 테이블

| 테이블 | 필드 | 의미 |
| --- | --- | --- |
| guestbook_boards | id (text PK) | 청첩장 식별자 |
| | is_open (boolean) | 신규 등록 허용 |
| | require_approval (boolean) | 관리자 승인 필요, 기본 true |
| guestbook_entries | id (bigint identity PK) | 목록 정렬 ID, API에서는 문자열 |
| | wedding_id (FK) | 청첩장 식별자 |
| | request_id (uuid) | 네트워크 재시도 중복 방지 |
| | client_id (uuid) | 브라우저별 제출 간격 제한 |
| | author_name (text) | 작성자 1~30자 |
| | message (text) | 축하 문구 1~300자 |
| | fingerprint (text) | 정규화된 이름·문구 중복 검사 |
| | approved (boolean) | 공개 여부, 기본 false |
| | created_at (timestamptz) | 서버 생성 시각 |

브라우저 입력 카운터와 maxlength는 UTF-16 길이를 사용하므로 이모지는 두 글자 이상으로 계산될 수 있습니다.
목록은 최신 ID부터 10개씩 조회하며 공개된 항목의 이름·문구·작성 시각·ID만 반환합니다.
작성 날짜는 Asia/Seoul로 표시합니다. 개인 식별용 client_id와 request_id는 목록에 노출하지 않습니다.

## 관리자 운영

Supabase Table Editor에서 메시지를 확인한 뒤 approved를 true로 바꾸면 공개됩니다.
게시글을 숨기려면 false로 바꿉니다. 브라우저에는 관리 권한을 제공하지 않습니다.
자동 공개를 원하는 경우 guestbook_boards.require_approval을 false로 바꿉니다(기존 대기 글은 그대로 유지).
등록을 닫으려면 is_open을 false로 바꿉니다.
다른 청첩장은 boards에 별도 id를 생성하고 guestbookWeddingId를 동일하게 지정합니다.

## 검증 및 스팸 방지

- UI: 공백 검증, 길이 제한, 등록 중 버튼 잠금, 숨겨진 봇 입력란, 실패 시 원문 유지.
- 요청: 내용이 같으면 네트워크 재시도에도 같은 request_id를 사용합니다.
- DB: 테이블 RLS 활성화, anon/authenticated의 직접 SELECT/INSERT/UPDATE/DELETE 차단.
- 공개 RPC만 허용하며 SECURITY DEFINER 함수는 빈 search_path와 명시한 테이블 경로를 사용합니다.
- DB 트랜잭션에서 보드 행을 잠가 동시 등록에도 제한이 적용됩니다.
- 같은 브라우저는 60초에 1회, 24시간에 10회. 보드 전체는 1시간에 100회로 제한합니다.
- 정규화된 동일 이름·문구는 24시간 내 중복 등록을 거절합니다.
- 사용자 입력은 textContent로만 출력하며 HTML이나 링크로 해석하지 않습니다.

client_id는 로컬 저장값이므로 저장소 삭제·직접 API 요청으로 변경될 수 있습니다. 브라우저별 제한은 신원 인증이 아닙니다.
승인 대기와 보드 전체 제한은 이 경우에도 적용되지만 분산 봇의 요청 자체까지 차단하지는 않습니다.
대규모 공개 배포 시 CAPTCHA를 검증하는 Supabase Edge Function과 IP 기반 제한을 추가할 수 있습니다.
그 경우 create RPC의 anon 실행 권한을 철회하고 해당 서버 경로만 쓰도록 전환해야 우회 요청도 차단됩니다.

## 테스트

`node tests/guestbook.test.mjs`: API 페이로드·입력 제한·오류·큰 ID·텍스트 렌더링·입력 보존·재시도 검사.
`supabase/guestbook-test.sql`: 실제 DB에서 실행할 승인·중복·제한·권한 검사.
현재 작업 환경에는 Supabase 프로젝트와 PostgreSQL 실행기가 없어 SQL의 실제 실행 및 배포 연결 검증은 미실시입니다.

공식 참고: [Supabase 데이터베이스 함수](https://supabase.com/docs/guides/database/functions),
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
