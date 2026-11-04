# 청첩장 콘텐츠 설정

콘텐츠 수정은 `config/wedding.config.js`에서만 합니다. 저장 후 페이지를 새로고침하면 반영됩니다.

- `basic`: 신랑/신부 이름, 한국 기준 날짜(YYYY-MM-DD), 시간(HH:mm). 표시 날짜·요일·오전/오후와 기본 공유 문구는 자동 생성됩니다.
- `hero`: 제목, 영문 소제목, 이미지의 src/alt/visible, 초대장 링크 문구.
- `invitation.parents`: 양가 부모님 배열. father/mother를 비우면 해당 이름은 생략됩니다.
- `weddingInfo`: 예식장 이름·홀·주소의 단일 원본. 오시는 길도 이 값을 사용합니다.
- `gallery.items`, `account.items`, `contact.items`, `location.links`: 순서대로 표시되는 배열.
- `location.coordinates`: latitude/longitude 숫자. 미설정은 null. 카카오 지도와 목적지 길찾기에 사용하는 WGS84 좌표입니다.
- `contact.items[].person`: groom 또는 bride. name이 비어 있으면 basic의 이름을 사용합니다.
- `share`: 카카오 공유 title/description/url/image. 제목·설명은 빈 문자열이면 자동 생성, URL은 빈 문자열이면 현재 주소 사용.
- `footer`: 감사 문구. 이름은 basic에서 자동 반영됩니다.
- `labels`: 버튼, 내비게이션, 입력 안내 및 상태 메시지.

섹션과 배열 항목은 `visible: false`로 숨깁니다. 이미지와 교통·주차 안내도 같은 방식입니다.
빈 갤러리·계좌·연락처 목록은 섹션을 자동으로 숨깁니다. 방명록은 기본 표시되며 Supabase 연결 전에는 입력이 비활성화됩니다. 연결 방법은 [방명록 설정](guestbook.md)을 참고하세요.
D-day는 `weddingInfo.showDday`로 표시 여부를 바꿉니다.

`js/core/config.js`는 DOM 없이 설정을 검증·정규화하고 독립된 객체를 반환합니다.
`js/core/config-view.js`와 각 섹션 모듈이 렌더링을 담당합니다.
유효하지 않은 날짜·시간은 명시적인 오류를 발생시킵니다. 외부 링크는 HTTP(S), 이미지는 HTTP(S) 또는 상대 경로를 받습니다.

카카오 SDK는 아직 연결하지 않았습니다. `getKakaoSharePayload(config, baseUrl)`로 제목·설명·절대 썸네일 URL을 가진 데이터를 얻을 수 있습니다.
현재 공유 버튼은 주소를 복사합니다. 브라우저의 OG 메타도 설정으로 갱신하지만,
JavaScript를 실행하지 않는 공유 크롤러의 미리보기에는 배포 시 정적 메타 생성 또는 서버 렌더링이 별도로 필요합니다.

검증: `node tests/config.test.mjs`

## 예식 정보와 D-day

날짜 처리 공통 유틸리티는 js/core/date.js에 있습니다. 표시 요일·시간과 D-day는 Asia/Seoul 기준이며 방문자의 기기 시간대에 영향을 받지 않습니다.
D-day는 예식 시각까지 남은 24시간 단위가 아니라 한국 달력상의 날짜 차이입니다.
예식 당일에는 labels.ddayToday, 다음 날부터 labels.ddayPast의 {days}를 지난 일수로 치환합니다.
페이지가 열려 있으면 한국 자정에 갱신하고, 숨겨진 탭에서 돌아왔을 때도 다시 계산합니다.
홀·주소가 빈 문자열이면 해당 줄을 숨깁니다. weddingInfo.showDday가 false이면 D-day와 갱신 타이머를 끕니다.

날짜 및 섹션 검증: node tests/date.test.mjs

## 갤러리

gallery.items에 { visible: true, src: "./assets/images/gallery/photo-01.svg", alt: "사진 설명" } 항목을 추가하면 썸네일과 확대 보기 순서에 반영됩니다.
썸네일은 지연 로딩하며 실패 시 안내를 표시합니다. 확대 화면은 로딩 상태·실패 안내·다시 시도 버튼을 제공합니다.
이전/다음 버튼과 좌우 방향키는 처음과 끝에서 순환합니다. ESC, 닫기 버튼, 모달 바깥 배경 클릭으로 닫습니다.
휴대폰에서는 사진 영역을 가로로 스와이프합니다. 세로 이동이나 여러 손가락 동작은 사진 전환으로 처리하지 않습니다.
모달을 닫으면 원래 스크롤 위치와 선택한 썸네일 포커스를 복원합니다. 사진이 하나면 이동 버튼을 숨기고, 없으면 갤러리 섹션을 숨깁니다.
오류 및 로딩 안내 문구는 labels.galleryLoading/galleryError/galleryRetry/galleryThumbnailError에서 수정합니다.
검증: node tests/gallery.test.mjs

## 지도와 길찾기 설정

1. weddingInfo.venue/address에 실제 예식장 이름과 주소를 입력합니다.
2. location.coordinates에 latitude(위도), longitude(경도)를 숫자로 입력합니다.
3. config/app.config.js의 kakaoMapJavascriptKey에 카카오 JavaScript 키를 입력합니다. 비어 있으면 kakaoJavascriptKey를 사용합니다.
4. 카카오 개발자 콘솔에서 지도 사용 설정과 JavaScript SDK 도메인을 등록합니다. 로컬 실행 주소와 배포 주소를 모두 확인하세요.
5. location.links의 provider: "naver" 항목 url에 네이버 지도에서 목적지를 지정한 길찾기 화면의 공유 URL을 붙여 넣습니다.

카카오 항목의 url이 비어 있으면 좌표로 목적지 길찾기 URL을 만듭니다. 직접 넣은 URL은 우선 사용합니다.
네이버 항목의 url이 비어 있으면 주소 검색으로 연결하고 버튼을 '네이버 지도에서 장소 찾기'로 표시합니다. 검색 링크를 길찾기로 표시하지 않습니다.
좌표가 없으면 카카오도 주소 검색으로 대체합니다. 각 링크는 visible: false로 숨길 수 있습니다.

지도는 services/map.js에서 SDK를 한 번 로드하고 예식장 마커를 표시합니다.
키·좌표 미설정, SDK 오류 또는 지도 타일 로딩 시간 초과 시 대체 안내가 표시되며 길찾기와 주소 복사는 유지됩니다.
지도 레이아웃은 화면 크기 변경에 맞춰 재계산합니다.
주소 복사는 Clipboard API를 사용하며 권한 거부나 미지원 환경에서는 수동 복사 안내를 제공합니다.

실제 지도 서비스 검증에는 유효한 키, 등록된 도메인, 실제 좌표와 공유 URL이 필요합니다.
자동 테스트는 SDK를 모의해 성공·실패·정리 동작을 확인합니다: node tests/location.test.mjs

공식 참고:
- [카카오 지도 Web API 및 길찾기 URL](https://apis.map.kakao.com/web/guide/)
- [네이버 지도 URL 복사 방법](https://help.naver.com/service/5637/contents/18760?lang=ko&osType=PC)

## 계좌 안내와 연락하기

account.items 배열에는 visible, label(신랑 측/신부 측), bank, holder, number를 입력합니다.
계좌번호는 앞자리 0을 보존하도록 반드시 문자열로 입력합니다. 항목 수에 제한 없이 설정 순서대로 표시됩니다.
복사 성공 시 공통 토스트를 표시하고, Clipboard API 미지원 또는 권한 거부 시 읽기 전용 입력란을 열어 계좌번호를 선택합니다. 직접 길게 누르거나 Ctrl+C로 복사할 수 있습니다.
관련 문구는 labels.copyAccount/accountCopied/copyFailed/accountCopyFallback/accountNumber/accountHolder에서 변경합니다.

contact.items에 양가 부모님 연락처 항목을 추가했습니다. 실제 name과 phone을 입력하고 visible을 true로 바꾸면 표시됩니다.
개별 연락처 visible: false 또는 전체 contact.visible: false로 숨길 수 있습니다.
신랑·신부는 person: "groom"/"bride"와 빈 name을 사용하면 basic의 이름을 자동 적용합니다.
전화번호는 원문 그대로 표시하며 링크에서는 공백·괄호·점·하이픈을 제거합니다. 숫자 및 맨 앞 국제전화 + 기호만 허용하며 유효하지 않은 번호는 표시하지 않습니다.
전화는 tel:, 문자는 sms: 링크로 기기의 연결 앱을 엽니다.

검증: node tests/account-contact.test.mjs
