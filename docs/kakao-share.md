# 카카오톡 공유

## 설정
- app.config.js의 kakaoJavascriptKey: 기존 JavaScript 키를 사용합니다.
- wedding.config.js의 share.title/description: 비어 있으면 이름과 예식 날짜로 생성.
- share.url: https://godzzu.github.io/wd_letter/
- share.image.src: ./assets/images/og/wedding.png (기본 1200×630 PNG 포함).
- share.image.alt: 이미지 설명.
- share.visible: 공유 버튼 표시 여부.

상대 이미지 주소는 공유 URL 기준으로 변환됩니다.
현재 이미지 URL: https://godzzu.github.io/wd_letter/assets/images/og/wedding.png
이미지는 로그인·쿠키 없이 외부에서 열리는 HTTPS PNG/JPEG 등으로 준비하세요.
SVG, HTTP, localhost와 사설 IP 주소는 공유 전에 거절합니다.
브라우저에서도 이미지 로딩을 확인하지만 카카오 스크랩 서버의 접근 가능성까지 보장하지는 않습니다.
이미지를 교체하거나 설정의 이미지 주소를 변경할 수 있습니다.

## 카카오 개발자 콘솔
1. 해당 JavaScript 키의 JavaScript SDK 도메인에 https://godzzu.github.io 를 등록합니다.
2. 제품 링크의 웹 도메인에도 https://godzzu.github.io 를 등록합니다.
3. 로컬 테스트가 필요하면 실제 사용하는 http://127.0.0.1:8000 또는 http://localhost:8000도 JavaScript SDK 도메인에 등록합니다.
4. 웹 도메인에는 origin, 공유 URL에는 /wd_letter/ 경로까지 포함합니다.

콘솔 등록과 배포는 코드 변경으로 자동 수행되지 않습니다.
지도 SDK와 공유 SDK는 별개입니다. 공유는 공식 JavaScript SDK 2.8.2의 Kakao.Share.sendDefault를 사용합니다.

## 모바일 / PC
SDK와 이미지를 준비한 뒤 클릭 이벤트 안에서 동기적으로 공유 함수를 호출합니다.
모바일 앱 연결 및 PC 공유창 처리는 SDK가 담당합니다.
로딩 또는 초기화 실패 시 안내를 표시하며 버튼을 누르면 준비를 재시도합니다.
준비 완료 후 다시 버튼을 눌러 공유창을 엽니다.
브라우저 팝업 차단, 도메인 불일치 등 카카오 화면 내부 오류는 해당 화면에서 확인해야 합니다.
공유창 열기와 실제 전송 완료는 다르므로 전송 완료 토스트를 임의로 표시하지 않습니다.

## 정적 Open Graph
설정 변경 후 배포 전에 npm run build:meta 를 실행하고 생성된 index.html을 함께 배포하세요.
브라우저의 동적 메타 변경만으로는 크롤러 미리보기가 갱신되지 않습니다.
명령은 설정의 제목·설명·절대 URL·이미지·이미지 설명을 index.html에 안전하게 이스케이프해 씁니다.
og:type, og:locale도 포함합니다. 저장소 하위 경로 /wd_letter/를 보존합니다.
배포 후 페이지 소스의 og:image와 PNG 접근을 확인하고 기존 미리보기 캐시가 남으면 카카오 스크랩 캐시 갱신 도구를 사용하세요.

## 검증
npm test에 SDK 모의 객체 기반 초기화·재시도·오류·클릭 처리 및 OG 생성 테스트를 포함했습니다.
실제 카카오 계정으로 로그인하거나 메시지를 보내지는 않았습니다. 새 PNG와 메타태그는 배포해야 외부 접근이 가능합니다.

공식 문서:
- [JavaScript SDK 다운로드](https://developers.kakao.com/docs/en/javascript/download)
- [카카오톡 공유 구현 및 도메인 설정](https://developers.kakao.com/docs/ko/kakaotalk-share/js-link)
