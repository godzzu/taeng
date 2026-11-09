# 방명록 관리자 페이지

`admin.html`은 별도 관리자 페이지입니다. 기존 청첩장 구성은 유지합니다. 배포 후 주소는 https://godzzu.github.io/wd_letter/admin.html 입니다. 현재 파일 생성은 완료했으며 GitHub Pages 배포 및 아래 DB 설치는 별도입니다.

## 처음 한 번 설정

1. Supabase 프로젝트의 SQL Editor에서 기존 `supabase/guestbook.sql`이 설치되어 있는지 확인합니다.
2. `supabase/guestbook-admin.sql` 전체를 실행합니다. 기존 방명록을 삭제하지 않습니다. Supabase의 pgcrypto 확장은 `extensions` 스키마에 있어야 합니다.
3. 프로젝트 소유자로 아래 SQL의 비밀번호 부분을 **직접 바꿔서** 실행합니다. 현재 청첩장 ID는 `config/app.config.js`의 `guestbookWeddingId`, 기본값 `default`입니다. 아래 예시 문자열을 실제 비밀번호로 사용하지 마세요.

```sql
select public.set_guestbook_admin_password(
  'default',
  '여기에-직접-정한-새-비밀번호'
);
```

비밀번호는 12자 이상, UTF-8 기준 72바이트 이하입니다. 영문·숫자 등을 조합한 긴 고유 비밀번호를 권장합니다. 비밀번호에 작은따옴표가 있으면 SQL에서 두 번(`''`) 입력합니다. 비밀번호를 저장소, config 파일, 채팅에 넣지 말고 본인의 SQL Editor에서만 설정합니다. 실행 후 비밀번호가 포함된 SQL 쿼리는 저장하지 않습니다.

4. 로컬 서버에서 `/admin.html`을 열거나 변경 파일을 GitHub Pages에 배포합니다. ID `default`와 설정한 비밀번호로 로그인합니다. 신랑·신부는 동일한 방명록 로그인 정보를 사용합니다.
5. `supabase/guestbook-admin-test.sql`을 SQL Editor에서 실행하면 권한 분리, 로그인 제한, 공개/비공개, 삭제, 세션 만료 등을 검증합니다. 테스트 데이터는 rollback됩니다.

## 사용법

- 전체 글(공개·비공개)을 최신순으로 50개씩 조회합니다. 더 보기로 이전 글을 확인합니다.
- **공개하기 / 비공개로 변경**을 누르면 해당 상태로 저장됩니다. 청첩장을 새로고침하면 공개 목록에 반영됩니다.
- **삭제**는 확인 창을 거친 후 영구 삭제합니다. 삭제 전 CSV로 보관할 수 있습니다.
- **전체 목록 CSV 저장**은 현재 화면의 50개만이 아니라 해당 방명록의 모든 공개·비공개 글을 조회하여 다운로드합니다. 한글 Excel 호환을 위해 UTF-8 BOM을 넣고 작성 날짜는 한국 시간으로 기록합니다. 수식으로 해석될 수 있는 사용자 입력 앞에는 작은따옴표를 붙입니다.
- 내보내기를 시작한 후 새로 등록된 글은 포함하지 않습니다. 내보내는 동안 다른 관리자가 기존 글을 수정/삭제하면 각 페이지 조회 시점의 상태가 반영됩니다.
- 새로고침 또는 탭 종료 시 다시 로그인합니다. 자동 만료는 2시간입니다. 사용을 마치면 로그아웃하세요.

## 비밀번호 변경 / 분실

Supabase 프로젝트 소유자가 위 `set_guestbook_admin_password` 함수를 다시 실행합니다. 이전 세션은 전부 무효화되고 로그인 실패 잠금도 해제됩니다. 일반 페이지에서 비밀번호를 재설정하거나 신규 관리자를 만들 수는 없습니다.

## 보안 및 저장 구조

- `guestbook_admin_credentials`: 방명록별 bcrypt 해시, 실패 횟수, 잠금 시간. 평문 비밀번호는 저장하지 않습니다.
- `guestbook_admin_sessions`: 256비트 무작위 토큰의 SHA-256 해시, 방명록 ID, 생성·만료 시간. 브라우저는 원본 토큰을 메모리에만 보관하며 URL·localStorage·sessionStorage에 저장하지 않습니다.
- 두 테이블은 RLS를 활성화하고 브라우저 역할의 직접 권한을 차단합니다. 관리자 RPC는 매 요청의 토큰·만료·방명록 소유 범위를 검사합니다. SQL 함수는 빈 search_path와 정규화된 스키마명을 사용합니다.
- 로그인 5회 연속 실패 시 해당 ID를 15분 잠급니다. 방명록 단위 제한이므로 공격자가 해당 ID의 로그인을 일시적으로 막을 수 있습니다. 대규모 공개 서비스에는 추가적인 네트워크 단위 제한/CAPTCHA 검증 계층이 필요합니다.
- 관리자 자격증명 생성 함수는 anon/authenticated에서 실행할 수 없습니다. service_role 또는 비밀키를 프런트엔드에 넣지 않습니다.
- 사용자 이름과 내용은 `textContent`로 표시하며 HTML로 삽입하지 않습니다.

공식 참고: [Supabase Database Functions](https://supabase.com/docs/guides/database/functions).

## 검증 범위

`node tests/guestbook-admin.test.mjs`에서 API 요청, CSV 이스케이프·수식 방어, 전체 페이지 저장, 세션 초기화와 오류를 확인합니다. 실제 Supabase 설치·로그인·권한 테스트는 소유자 권한과 설정한 비밀번호가 필요하며 이번 로컬 작업에서 실행하지 않았습니다.

`node tests/admin-ui.test.mjs`에서 HTML 입력의 텍스트 표시, 로그인 후 비밀번호 제거, 공개 변경 안내, 삭제 취소/확인, 만료 시 목록 제거를 검증했습니다. 로컬 브라우저 로그인 화면은 320·375·430·768px에서 가로 넘침이 없었습니다. `/` 및 `/wd_letter` 경로의 관리자 HTML·CSS·JS 모듈 제공 테스트도 통과했습니다.
