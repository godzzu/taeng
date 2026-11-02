# Mobile Wedding Invitation

HTML5, CSS3, Vanilla JavaScript ES Modules로 구성한 단일 페이지 모바일 청첩장 초기 프로젝트입니다.

## 실행 방법

ES Modules는 `file://` 환경에서 브라우저 보안 정책으로 동작하지 않을 수 있습니다. 로컬 웹 서버로 실행하세요.

Python이 설치되어 있다면 프로젝트 루트에서:

```bash
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다.

## 콘텐츠 및 디자인 변경

- 청첩장 콘텐츠: `config/wedding.config.js`
- 앱 연동 설정: `config/app.config.js`
- 템플릿 ID: `wedding.config.js`의 `templateId`
  - `wedding-floral`
  - `wedding-sketch`

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
- [x] 청첩장 주소 복사
- [ ] 카카오톡 SDK 공유(앱 키 설정 후 구현)
- [ ] 방명록 저장/조회(Supabase 또는 Firebase 연결 필요)

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
