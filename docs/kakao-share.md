# 링크 미리보기와 Open Graph

현재 프로젝트에는 카카오톡 공유 버튼과 공유 JavaScript SDK가 없습니다. 이 문서 경로는 기존 링크 호환을 위해 유지합니다. 카카오 지도 SDK와 지도용 키는 계속 사용합니다.

## 설정

config/wedding.config.js의 share에서 관리합니다.

- title / description: 비어 있으면 이름과 예식 일시로 자동 생성.
- url: 실제 배포 HTTPS URL. 현재 https://godzzu.github.io/wd_letter/
- image.src: 기본 ./assets/images/og/wedding.png. 상대 경로는 공유 URL 기준으로 변환.
- image.alt: 공유 이미지 설명.

share.visible과 공유 버튼 상태 labels는 제거했습니다. OG 생성은 SDK 초기화나 카카오 키 없이 수행합니다. 현재 검증은 이미지가 활성화되고 src가 있으며 공개 HTTPS 주소인 것을 요구하고 SVG를 거부합니다. URL 검증은 실제 이미지 서버의 접근 성공을 보장하지 않습니다.

## 생성과 배포

`npm run build`는 dist/index.html에 정적 OG 태그와 페이지 제목을 생성합니다. 브라우저 실행 없이 크롤러가 읽을 수 있습니다. 소스 index.html만 갱신하려면 `npm run build:meta`를 사용하며 이 명령은 전체 배포 빌드를 대체하지 않습니다.

URL·이미지 검증 및 데이터 구성은 js/core/share-metadata.js, HTML 이스케이프와 태그 삽입은 scripts/build-share-meta.mjs에서 처리합니다. 브라우저의 메타데이터 갱신은 기존 config-view.js에서 유지합니다.

배포 후 HTML 소스의 og:url / og:image와 이미지의 인증 없는 HTTPS 접근을 확인합니다. 실제 링크 미리보기와 캐시는 서비스에서 별도 확인해야 합니다.

## 테스트

`node tests/share-metadata.test.mjs`는 공개 HTTPS URL, 이미지 제한, HTML 이스케이프, 반복 생성, 배포 URL 덮어쓰기, 누락된 태그를 검증합니다. 실제 SDK 호출이나 메시지 전송 테스트는 포함하지 않습니다.
