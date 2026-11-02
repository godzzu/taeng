# 청첩장 콘텐츠 설정

콘텐츠 수정은 `config/wedding.config.js`에서만 합니다. 저장 후 페이지를 새로고침하면 반영됩니다.

- `basic`: 신랑/신부 이름, 한국 기준 날짜(YYYY-MM-DD), 시간(HH:mm). 표시 날짜·요일·오전/오후와 기본 공유 문구는 자동 생성됩니다.
- `hero`: 제목, 영문 소제목, 이미지의 src/alt/visible, 초대장 링크 문구.
- `invitation.parents`: 양가 부모님 배열. father/mother를 비우면 해당 이름은 생략됩니다.
- `weddingInfo`: 예식장 이름·홀·주소의 단일 원본. 오시는 길도 이 값을 사용합니다.
- `gallery.items`, `account.items`, `contact.items`, `location.links`: 순서대로 표시되는 배열.
- `location.coordinates`: latitude/longitude 숫자. 미설정은 null. 지도 SDK 연결에 사용할 데이터이며, 현재 지도 화면은 외부 링크 방식입니다.
- `contact.items[].person`: groom 또는 bride. name이 비어 있으면 basic의 이름을 사용합니다.
- `share`: 카카오 공유 title/description/url/image. 제목·설명은 빈 문자열이면 자동 생성, URL은 빈 문자열이면 현재 주소 사용.
- `footer`: 감사 문구. 이름은 basic에서 자동 반영됩니다.
- `labels`: 버튼, 내비게이션, 입력 안내 및 상태 메시지.

섹션과 배열 항목은 `visible: false`로 숨깁니다. 이미지와 교통·주차 안내도 같은 방식입니다.
빈 갤러리·계좌·연락처 목록은 섹션을 자동으로 숨깁니다. 방명록은 기본 숨김이며 저장 서비스는 별도 연동해야 합니다.
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
