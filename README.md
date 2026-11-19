# Mobile Wedding Invitation

HTML, CSS, Vanilla JavaScript ES Modules로 구성한 모바일 청첩장입니다. 콘텐츠는 설정 파일로 관리하고, `templateId`와 CSS 변수로 디자인을 전환합니다.

## 로컬 실행

Node.js **20.10 이상**이 필요합니다. 배포 workflow는 Node 22를 사용합니다. 외부 npm 패키지가 없어 `npm install`은 필요하지 않지만, **배포용 빌드는 필요합니다**.

1. 처음 내려받았다면 `.env.example`을 `.env`로 복사하고 공개 연결 정보를 입력합니다. 기존 `.env`는 덮어쓰지 않습니다.
2. 프로젝트 폴더에서 `npm start`를 실행합니다.
3. 청첩장은 http://127.0.0.1:8000/ , 관리자는 http://127.0.0.1:8000/admin.html 에서 확인합니다.

종료는 `Ctrl+C`, 포트 변경은 `npm start -- --port 8001`입니다. `.env` 변경 후 서버를 재시작합니다. 개발 서버는 같은 컴퓨터에서만 접속할 수 있습니다.

| 명령 | 역할 |
| --- | --- |
| `npm start` / `npm run dev` | .env 로딩 → 공개 설정 생성 → 개발 서버 실행 |
| `npm run build:config` | 공개 설정만 생성. 다른 정적 서버 사용 전 실행 |
| `npm test` | 공개 설정 생성 후 자동 테스트 실행 |
| `npm run build` | dist 재생성 및 공개 설정·정적 OG 메타태그를 포함한 배포 파일 생성 |
| `npm run build:meta` | 소스 index.html의 OG 메타태그만 갱신. 전체 빌드를 대체하지 않음 |

## 설정과 구조

| 경로 | 역할 |
| --- | --- |
| `config/wedding.config.js` | 이름, 예식 일시, 사진, 문구, 장소, 계좌·연락처 조회 ID, 음악 key, 표시 여부 |
| `.env` | 카카오·Supabase 공개 연결 설정. Git 제외 |
| `config/app.config.js` | 생성된 공개 설정을 앱에 제공 |
| `config/public-env.js` | 자동 생성 파일. 직접 편집·커밋하지 않음 |
| `css/themes/` | 여섯 템플릿의 디자인 |
| `js/sections/`, `js/services/`, `js/core/` | 화면, 외부 서비스, 공통 로직 |
| `assets/images/` | 사진, 로고, 장식, 공유 이미지 |
| `supabase/` | 방명록·관리자·음악 설치 및 검증 SQL |
| `scripts/`, `tests/` | 빌드, 개발 서버, 테스트 |

지원 templateId: `wedding-floral`, `wedding-sketch`, `wedding-ticket`, `wedding-marble`, `wedding-autumn`, `moonlight`. 현재 기본 테마는 `moonlight`입니다.

갤러리는 `gallery.items`, 소개 사진은 `invitation.parents`의 이미지 설정으로 관리합니다. 예식 일시는 `basic.weddingDate`, `basic.weddingTime`이며 한국 시간 기준입니다. 연결 설정은 [환경변수 안내](docs/environment.md)를 우선 참고하세요. 기존 기능별 문서에 app.config.js 직접 입력 안내가 남아 있다면 .env 방식으로 적용합니다.

## 현재 기능

- 본문 7개 섹션: hero, invitation, wedding-info, gallery, location, account, guestbook. 실제 순서는 index.html을 따릅니다.
- 신랑·신부 소개 사진 카드와 페이드 전환, 부모님·관계·고인 표시.
- invitation의 축하연락하기 모달. 공개 활성화한 연락처만 전화·문자 링크 표시.
- Wedding Day 달력과 박스형 카운트다운. 안내 문구 두 줄과 일 : 시간 : 분 : 초 표시, 예식 시작 시 종료.
- 갤러리 확대 모달, 키보드·스와이프, 지연 로딩 및 이미지 실패 안내.
- 지도, 카카오맵·네이버지도 링크, 주소 복사 및 교통·주차 안내.
- 계좌 아코디언, 복사 및 토스트. 계좌·연락처 실제 값은 Supabase에서 클릭 시 조회.
- Supabase 방명록과 관리자 로그인·공개 전환·삭제·CSV 저장.
- `music.key`로 Supabase 등록 음원 선택. 고정 스피커 버튼으로 재생·정지. 관리자 음원 업로드 기능 없음.
- 화면 너비 100%, 최대 448px 및 스크롤 fade-up 효과.

헤더 메뉴, 하단 감사 영역, 독립 contact 섹션, 카카오톡 공유 버튼은 현재 화면에 없습니다. 링크 미리보기용 `share.title`, `description`, `url`, `image` 및 OG 생성은 유지합니다. OG URL·이미지 검증은 `js/core/share-metadata.js`로 분리되어 있으며, 공유 SDK 코드는 제거했습니다.

## GitHub Pages 배포

현재 `.github/workflows/pages.yml`은 **수동 실행하여 dist만 업로드하는 방식**입니다. 소스 루트를 직접 배포하면 생성된 공개 설정이 누락될 수 있습니다.

1. 저장소 Settings → Secrets and variables → Actions의 Repository secrets에 아래 값을 등록합니다.
   - `PUBLIC_KAKAO_JAVASCRIPT_KEY`
   - `PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY` (지도 전용 키. 미설정 시 위 키 사용)
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
2. 기본값과 다르면 Repository variables에 `PUBLIC_GUESTBOOK_PROVIDER`(기본 supabase), `PUBLIC_GUESTBOOK_WEDDING_ID`(기본 default)를 등록합니다.
3. wedding.config.js의 `share.url`을 실제 URL에 맞춥니다. 현재 설정은 `https://godzzu.github.io/wd_letter/`입니다.
4. `npm test`, `npm run build` 및 [배포 체크리스트](docs/pre-deployment-checklist.md)를 확인합니다.
5. 코드를 push하고 Settings → Pages → Source를 GitHub Actions로 설정합니다.
6. Actions → Deploy wedding invitation → Run workflow를 실행합니다. push만으로 자동 배포되지 않습니다.
7. 배포 후 청첩장, `/wd_letter/admin.html`, 지도·이미지·음악·방명록·링크 미리보기를 확인합니다.

빌드는 HTML, CSS, JS, 이미지, 공개 설정, .nojekyll을 dist에 생성합니다. .env, 개발 스크립트, 테스트, 문서, Supabase SQL은 포함하지 않습니다. 로컬 .env는 CI에 전달되지 않으므로 Actions에 별도로 등록해야 합니다.

## 공개 데이터와 외부 서비스

.env는 설정을 저장소에서 분리하는 수단이며 브라우저 공개 키를 숨기지는 않습니다. Supabase service_role/sb_secret_, 관리자 비밀번호, Turnstile secret은 넣지 않습니다. `visible: false`는 화면 표시만 숨기므로 공개하면 안 되는 개인정보는 설정 값에서도 제거합니다.

방명록·관리자·음악에는 외부 Supabase 설정이 필요합니다. 지도 도메인/API와 DB 권한·승인 정책은 실제 배포 환경에서 확인합니다.

## 관련 문서

- [연락처·계좌 테이블 설치 및 입력](docs/private-info.md) — 새 버전 배포 전에 설치 필요
- [환경변수와 빌드](docs/environment.md)
- [콘텐츠 설정](docs/configuration.md) · [디자인 시스템](docs/design-system.md)
- [방명록](docs/guestbook.md) · [관리자 설치](docs/guestbook-admin.md) · [음악](docs/music.md)
- [현재 배포 체크리스트](docs/pre-deployment-checklist.md)
- [코드 정리 검토서](docs/deployment-cleanup-review.md)
