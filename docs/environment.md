# 환경변수 설정

Node.js 20.10 이상을 사용한다. 현재 로컬 값은 루트 `.env`로 이전되어 있다.
새 체크아웃에서는 `.env.example`을 `.env`로 복사한 뒤 값을 입력한다.

| 변수 | 용도 |
| --- | --- |
| PUBLIC_KAKAO_JAVASCRIPT_KEY | 카카오 JavaScript 키 |
| PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY | 지도 전용 JavaScript 키, 빈 값이면 위 키 사용 |
| PUBLIC_SUPABASE_URL | Supabase 프로젝트 URL |
| PUBLIC_SUPABASE_PUBLISHABLE_KEY | publishable 또는 legacy anon 키 |
| PUBLIC_GUESTBOOK_PROVIDER | supabase 또는 none, 기본 supabase |
| PUBLIC_GUESTBOOK_WEDDING_ID | 방명록 ID, 기본 default |

## 로컬 실행

`npm start` 또는 `npm run dev`를 실행하고 http://127.0.0.1:8000 을 연다.
`.env`를 변경한 경우 서버를 재시작한다. 기존 서버가 켜져 있다면 종료 후 다시 시작한다.
Node의 네이티브 env-file 파서를 사용하므로 따옴표와 주석을 지원하며, OS/CI에 지정한 환경변수가 `.env`보다 우선한다.

실행 시 `config/public-env.js`를 생성하고 `config/app.config.js`에서 가져온다.
다른 정적 서버를 사용하려면 먼저 `npm run build:config`를 실행해야 한다.
`.env` 접근을 차단하는 제공 개발 서버(`npm start`) 사용을 권장한다.
직접 `node scripts/dev-server.mjs`로 실행하면 `.env` 로딩 단계를 건너뛰므로 npm 명령을 사용한다.

## 빌드와 배포

`npm run build`는 기존 `dist`를 새로 만들고 HTML/CSS/JS/이미지와 공개 설정만 복사한다.
`.env`, Supabase 서버 코드, 문서, 테스트는 배포 결과에 포함하지 않는다.
상대 경로를 유지하므로 `/wd_letter/`에서도 사용할 수 있다.

GitHub Pages는 `.env`를 직접 읽지 않는다. 기존 'Deploy from a branch' 대신:

1. 저장소 Settings → Secrets and variables → Actions에서 위 PUBLIC 키/URL 네 항목을 Repository secrets로 추가한다.
2. PROVIDER와 WEDDING_ID가 기본값과 다르면 같은 이름의 Repository variables로 추가한다.
3. Settings → Pages → Source를 GitHub Actions로 변경한다.
4. 코드를 push한 뒤 Actions → Deploy wedding invitation → Run workflow를 실행한다.

추가된 `.github/workflows/pages.yml`은 수동 실행 방식이며 현재 원격 설정 변경·업로드·배포는 수행하지 않았다.
로컬 `.env`는 Git에 포함되지 않으므로 CI에는 별도로 값을 등록해야 한다.

Cloudflare Pages는 빌드 명령 `npm run build`, 출력 디렉터리 `dist`, Node 22로 설정하고
프로젝트의 환경변수에 동일한 이름으로 값을 등록한다. 변경 후 재배포한다.

## 공개 키와 비밀 키

`.env`는 저장소에 값을 하드코딩하지 않기 위한 설정 관리 수단이다.
공개 클라이언트 키는 최종 `public-env.js`와 네트워크 요청에서 확인할 수 있다.
Supabase service_role/sb_secret_, Turnstile secret, 관리자 비밀번호는 넣지 않는다.
생성기는 지정된 6개 변수만 내보내며 Supabase 서버 키를 거부한다.
서버 전용 비밀 값은 Supabase Edge Function 또는 서버 환경변수에 보관해야 한다.
카카오 도메인 등록과 Supabase RLS/서버 권한 검증은 계속 필요하다.

`npm test`는 먼저 로컬 공개 설정을 생성한 뒤 기존 테스트와 환경변수 테스트를 실행한다.
`.env`와 `config/public-env.js`, `dist`는 Git에서 제외된다. 이미 커밋된 과거 키는 이번 변경으로 Git 이력에서 지워지지 않는다.
