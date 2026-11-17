# GitHub Pages 배포 전 코드 정리 검토

검토일: 2026-11-17. 현재 소스 참조와 빌드 구성을 점검했으며, 파일 삭제·실제 배포는 하지 않았다.

## 결론

현재 `scripts/build.mjs`는 배포에 필요한 HTML, CSS, JS, 이미지, 공개 설정만 `dist`로 복사한다. `.github/workflows/pages.yml`은 이 `dist`만 업로드한다. 저장소에서 개발용 파일을 삭제하는 것과 웹사이트 배포에서 제외하는 것은 구분해야 한다.

## 배포 제외 상태 유지

| 항목 | 처리 |
| --- | --- |
| `.env`, `.env.*` | 로컬 설정 유지. Git 및 dist 제외. `.env.example`만 저장소에 유지 |
| `config/public-env.js` | Git 제외, 실행/빌드 때 생성. dist에는 반드시 포함 |
| `tests/`, `scripts/`, `docs/` | 개발·검증·빌드에 필요하므로 저장소 유지. dist에는 포함되지 않음 |
| `supabase/` | 방명록·관리자·음악 DB 구축 및 관리용 소스. 저장소 유지, dist 제외 |
| `wrangler.jsonc` | Cloudflare용 설정. Pages에는 불필요하지만 dist에서 이미 제외. Cloudflare 사용을 중단할 때만 삭제 고려 |

Git 추적 파일 검사에서 `.env`, `config/public-env.js`, `dist`는 추적되지 않았다. 공개 저장소에 올릴 경우에는 dist와 별개로 저장소의 문서·사진·설정 내용도 공개된다. 이번 검토는 Git 전체 이력에 대한 비밀정보 감사는 아니다.

## 제거 후보와 처리 상태

2026-11-17 후속 정리: footer 설정·정규화, 헤더 labels·brand 스타일, D-day 전용 labels·자정 타이머 함수와 해당 테스트를 제거했다. 현재 카운트다운의 날짜 차이 계산과 검증은 유지했다. OG 검증을 js/core/share-metadata.js로 분리하고 공유 SDK·전용 labels·버튼 테스트도 제거했다. 아래 목록은 정리 전 검토 기록이다.

| 항목 | 근거 및 함께 정리할 부분 |
| --- | --- |
| `config/wedding.config.js`의 `footer` | 하단 감사 영역이 제거됨. `js/core/config.js`의 footer 정규화도 함께 정리 |
| `labels.brand`, `weddingNav`, `galleryNav`, `locationNav` | 헤더와 바로가기 링크가 제거되어 현재 화면 참조 없음 |
| `labels.ddayToday`, `labels.ddayPast` | 카운트다운으로 전환되어 현재 렌더링에서 사용하지 않음. 날짜 테스트의 오래된 fixture도 정리 |
| `js/core/date.js`의 `millisecondsUntilKoreanMidnight` | 현재 운영 코드 호출 없음. 기존 함수 테스트만 남아 있으므로 함께 정리 가능 |
| `js/services/kakao-share.js`의 공유 버튼 초기화 및 SDK 로딩 부분 | `js/main.js`에서 호출하지 않음. 단, 파일 전체 삭제는 불가: 아래 OG 의존성 분리 필요 |

카카오 공유를 완전히 정리하려면 `publicHttpsUrl`, `getKakaoSharePayload`가 제공하는 URL·이미지 검증과 메타데이터 생성을 별도 모듈로 먼저 옮기고 `scripts/build-share-meta.mjs` 및 테스트 import를 변경한다. 이후 SDK/공유 버튼 전용 코드와 labels를 제거한다. `share.title`, `description`, `url`, `image` 및 OG 메타태그는 유지한다. 카카오 JavaScript 키도 지도에서 대체 키로 사용하므로 함께 삭제하지 않는다.

## 참조 없는 이미지 후보

현재 HTML, JS, CSS, 설정 파일에서 참조되지 않는 경로다. 향후 콘텐츠 교체용으로 보관할지는 별도로 판단한다. 파일명이 sample이라는 이유만으로 현재 사용 중인 이미지를 지우면 안 된다.

- `assets/images/gallery/sample02.png`
- `assets/images/gallery/sample03.png`
- `assets/images/logo/kakao_map(horizontal1).jpg`
- `assets/images/common/white-chrysanthemum.svg`
- `assets/images/templates/floral/blue-watercolor-corner.png`
- `assets/images/templates/floral/flowers.svg`
- `assets/images/templates/floral/memorial-chrysanthemum.svg`
- `assets/images/templates/floral/name-flower.svg`
- `assets/images/templates/marble/paper.svg`
- `assets/images/templates/sketch/curve-frame.svg`
- `assets/images/templates/sketch/flowers.svg`

이 중 큰 PNG/JPG 네 파일은 합계 약 2.2 MiB다. 현재 assets 디렉터리를 통째로 복사하므로 미사용 파일도 dist에 포함된다. 제거 시 배포 용량은 줄지만, 페이지가 참조하지 않으므로 초기 로딩 속도가 같은 크기만큼 빨라지는 것은 아니다.

`assets/images/**/README.txt` 세 파일도 현재 dist에 포함된다. 원본 안내는 저장소에 남기고 빌드 복사에서 제외하는 편이 좋다.

## 반드시 유지할 항목

- `js/sections/contact.js`: 독립 섹션 대신 invitation의 축하 연락하기 모달에서 사용.
- `admin.html`, `js/admin.js`, `css/admin.css`, 관리자 API: 방명록 관리자 기능에 필요.
- `config/wedding.config.js`: 콘텐츠와 이미지 설정에 필요. 숨김 옵션은 데이터 자체의 비공개를 의미하지 않으므로 공개하면 안 되는 연락처·계좌값은 파일에서도 비워야 함.
- 다섯 테마 CSS와 현재 참조되는 장식 이미지: templateId 전환 유지에 필요.
- `scripts/build*.mjs`, `scripts/with-env.mjs`, `package.json`, Pages workflow: 환경변수 생성 및 배포에 필요.
- `getWeddingDayState`: 카운트다운 안내 문구의 남은 날짜 계산에서 계속 사용.

## 삭제보다 먼저 수정할 문서

`README.md`에 Node 20 이상, 빌드 불필요, 기존 파일 그대로 배포, Deploy from a branch, 공유 버튼, 3개 템플릿 등 오래된 안내가 남아 있다. 현재 Node 20.10 이상, `.env` 준비, `npm run build`, GitHub Actions의 dist 업로드, 5개 템플릿과 연락처 모달 구조로 갱신해야 한다.

`docs/pre-deployment-checklist.md`는 2026-11-05 당시 결과이며 현재 화면의 검증 결과로 사용하면 안 된다. 기존 기록은 날짜를 유지하고 새 배포 점검 결과를 추가하는 것이 적절하다. 현재 환경변수·배포 절차는 `docs/environment.md`를 참고한다.

## 권장 정리 순서

1. README와 배포 체크리스트 갱신.
2. 미사용 footer·헤더 labels·D-day 코드와 관련 테스트 정리.
3. OG 생성 기능을 분리한 후 공유 SDK 잔여 코드 정리.
4. 미사용 이미지 삭제 또는 프로젝트 외부 보관, assets README의 배포 제외.
5. `npm test`, `npm run build` 후 dist 내 파일 및 5개 테마 화면 확인.
6. 저장소 Actions 환경변수와 Pages Source 설정 후 수동 배포. 현재 workflow는 push 자동 배포가 아닌 workflow_dispatch 방식.

이번 검토에서는 위 후보를 삭제하거나 외부 서비스 설정을 변경하지 않았다.
