# Mobile Wedding Invitation

HTML5, CSS3, Vanilla JavaScript ES Modules로 구성한 단일 페이지 모바일 청첩장 초기 프로젝트입니다.

## 실행 방법

ES Modules는 `file://` 환경에서 브라우저 보안 정책으로 동작하지 않을 수 있습니다. 로컬 웹 서버로 실행하세요.

Node.js 20 이상이 설치된 환경에서 프로젝트 폴더로 이동한 뒤 실행합니다.
외부 패키지가 없어 `npm install`이나 빌드 과정은 필요하지 않습니다.

```bash
npm start
```

브라우저에서 `http://127.0.0.1:8000`을 엽니다. 종료는 `Ctrl+C`입니다.
`npm run dev`도 동일하게 실행됩니다. 파일 수정 후에는 브라우저를 새로고침하세요.

포트가 사용 중이면 `npm start -- --port 8001`로 변경할 수 있습니다.
이 서버는 로컬 개발용이며 같은 컴퓨터에서만 접속할 수 있습니다.

검증은 `npm test`로 실행합니다. 설정·한국 시간 날짜 계산·서버의 모듈 및 정적 파일 제공을 확인합니다.

### 초기 실행 흐름

`npm start` → `scripts/dev-server.mjs` → `index.html` → `js/main.js`

`js/main.js`에서 설정 검증 → 테마 적용 → 공통 콘텐츠 렌더링 → 섹션 초기화 → 공유 버튼 연결 순서로 실행됩니다.
운영 배포에는 개발 서버가 필요하지 않으며 기존 정적 파일을 그대로 사용할 수 있습니다.

## 콘텐츠 및 디자인 변경

- 청첩장 콘텐츠: `config/wedding.config.js`
- 앱 연동 설정: `config/app.config.js`
- 템플릿 ID: `wedding.config.js`의 `templateId`
  - `wedding-floral`
  - `wedding-sketch`
  - `wedding-ticket`

## 이미지 교체

갤러리 이미지 경로는 `config/wedding.config.js`의 `gallery.items` 배열에서 변경합니다. 실제 배포 이미지에는 JPG 또는 WebP 사용을 권장합니다.

## 기능 상태

- [x] 8개 섹션의 초기 레이아웃
- [x] 템플릿 ID 기반 테마 적용
- [x] 설정 파일 기반 콘텐츠 렌더링
- [x] 갤러리 모달, 이전/다음, 터치 스와이프
- [x] 계좌번호 복사 및 토스트
- [x] 전화 및 문자 링크
- [x] 지도 서비스 외부 링크
- [x] 카카오톡 공유 버튼
- [x] Kakao JavaScript SDK 공유 및 정적 OG 메타 생성
- [x] Supabase 방명록 등록/조회 코드 및 DB 구조(프로젝트 연결 필요)

## GitHub Pages 배포

1. 프로젝트 파일을 GitHub 저장소에 push합니다.
2. 저장소의 **Settings → Pages**로 이동합니다.
3. 배포 소스로 `Deploy from a branch`를 선택합니다.
4. 브랜치와 폴더(`/root` 또는 설정한 배포 폴더)를 선택합니다.
5. 배포 URL을 확인합니다.

저장소 하위 경로 배포를 고려해 HTML, CSS, JS 및 이미지 경로는 상대경로를 사용합니다.

## 보안 주의

GitHub Pages에 올라간 JS 설정은 공개됩니다. 카카오 JavaScript 키처럼 브라우저에 노출되는 공개 키만 설정하고, Supabase service role key, Firebase Admin credential, 관리자 비밀번호 등 비밀정보는 절대 커밋하지 마세요. 방명록은 데이터베이스 보안 규칙과 스팸 방지 정책을 별도로 설정해야 합니다.

## 콘텐츠 설정 구조

모든 콘텐츠와 표시 여부는 `config/wedding.config.js`에서 관리합니다. 상세 필드와 사용법은 [설정 문서](docs/configuration.md)를 참고하세요.

## 방명록

Supabase 연결과 승인 운영 방법은 [방명록 설정](docs/guestbook.md)을 참고하세요.

## 카카오톡 공유

배포 전에 npm run build:meta를 실행하세요. 키·도메인 설정은 [카카오 공유 안내](docs/kakao-share.md)에 정리했습니다.

## 통합 점검

화면 크기별 결과, 수정 사항, 외부 서비스 확인 범위는 [최종 배포 체크리스트](docs/pre-deployment-checklist.md)를 참고하세요.

## 방명록 관리자 페이지

`admin.html`에서 방명록 ID/비밀번호 로그인, 공개·비공개 전환, 삭제, 전체 CSV 저장을 지원합니다. 사용 전 Supabase SQL 설치와 관리자 비밀번호 설정이 필요합니다. 자세한 절차는 [관리자 설치 안내](docs/guestbook-admin.md)를 참고하세요.

## 청첩장 배경음악

Supabase에 등록된 음원을 config/wedding.config.js의 music.key로 선택합니다. 해당 곡의 재생·정지 버튼을 표시하며 관리자 업로드 기능은 없습니다. [음악 설정 안내](docs/music.md)를 확인하세요.
