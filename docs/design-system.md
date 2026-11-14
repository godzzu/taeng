# 모바일 청첩장 디자인 시스템

최종 정리: 2026-11-07. Floral·Sketch·Ticket 세 템플릿을 지원한다. 기존 8개 섹션 DOM, 설정 데이터, 갤러리·지도·복사·방명록·공유 기능은 유지한다.

## 구조와 테마 전환

- `config/wedding.config.js`: 콘텐츠와 `templateId`. 현재 기본값은 `wedding-sketch`.
- `css/variables.css`: 공통 토큰 계약과 폴백.
- `css/common.css`, `css/layout.css`: 공통 타이포그래피·레이아웃·접근성·반응형.
- `css/components/sections.css`, `buttons.css`: 공통 섹션 및 버튼 동작 표현.
- `css/themes/floral.css`: Floral 토큰과 테마에만 필요한 꽃·프레임 스타일. 모든 선택자는 `html[data-theme="wedding-floral"]` 아래로 한정한다.
- `css/themes/sketch.css`: 블루·민트 펜 드로잉과 곡선 프레임 테마.

```js
import { applyTheme } from './js/core/theme.js';
applyTheme('wedding-floral');
applyTheme('wedding-sketch');
applyTheme('wedding-ticket');
```

`applyTheme`는 루트 `data-theme`과 `theme-color`만 갱신한다. HTML 재생성이나 섹션 재초기화가 없으므로 입력값, 이벤트와 모달 상태를 유지한다. 세 테마 CSS는 항상 로드한다.

## Floral 색상

| 토큰 | Floral | 용도 |
| --- | --- | --- |
| --color-background | #FAF9F5 | 아이보리 종이 |
| --color-surface | #FFFEFA | 카드·입력 |
| --color-primary | #B7CDDE | 파우더 블루 |
| --color-secondary | #A9B6AC | 세이지 잎 |
| --color-soft | #F0F4F5 | 지도 대체 영역 등 |
| --color-text / heading | #465A69 | 본문·제목 |
| --color-muted | #60717C | 보조 안내 |
| --color-action / focus | #49677E | 주요 버튼·포커스 |
| --color-action-hover | #385469 | 주요 버튼 hover |
| --color-border | #CCD6DC | 카드·사진 테두리 |
| --color-accent | #E7EFF4 | 선택·보조 강조 |
| --floral-frame | #DEDBD1 | 종이 이중 테두리 |

꽃의 옅은 색은 장식에만 사용한다. 텍스트와 조작 요소는 어두운 청회색을 사용한다. Sketch는 기존 흰색·검정 토큰을 유지한다.

## 타이포그래피

- 한글 제목 및 초대 문구: Noto Serif KR → Batang → serif. 제목 22.4–30.4px, Hero 21.6–32px.
- 본문·계좌·연락처·폼: 기존 시스템 한글 고딕. 본문 줄간격 1.9, 초대 문구 2.35.
- 영문 브랜드: Allura → Segoe Script → cursive, 24px. 영문 섹션 보조 제목은 Georgia italic, 12px, 자간 .15em.
- Google Fonts는 display=swap으로 로드한다. 네트워크가 없으면 시스템 대체 폰트를 사용한다.
- 콘텐츠는 설정을 그대로 표시한다. 시안의 가상 이름이나 날짜, 문구로 교체하지 않는다.

## 여백과 프레임

- 공통 간격 눈금: 4 / 8 / 12 / 16 / 24 / 32 / 48px.
- 바깥 가로 여백: 16–28px. 섹션 바깥 세로 여백: 24–48px.
- 종이 패널 내부: 위 88px, 아래 112px, 좌우 24–48px. 359px 이하에서는 좌우 22px.
- Hero 패널: 위 128px, 아래 100px. 위쪽 타원 아치와 얇은 이중선.
- Invitation 패널: 낮은 아치형 상단. 다른 섹션은 직선 이중 테두리.
- 테두리는 패널 안쪽 12px, 선 두께 1px. 흰 안쪽 선과 약한 음영으로 종이에 눌린 느낌을 표현한다.
- 테마별 패널 내부 여백은 floral.css에, 공통 콘텐츠 구조는 layout.css와 sections.css에 유지한다.

## 이미지와 장식

- `assets/images/templates/floral/blue-watercolor-corner.png`: 투명 수채화 꽃 모서리, 약 936KiB. 동일 파일을 각 섹션에서 재사용해 브라우저 캐시를 공유한다.
- `assets/images/templates/floral/paper.svg`: 약한 단색 노이즈로 만든 아이보리 종이 질감.
- 기존 `flowers.svg`는 호환을 위해 남겨두지만 새 Floral 테마는 사용하지 않는다.
- 꽃은 왼쪽 아래 배경과 오른쪽 위 의사 요소(180도 회전)에 배치한다. 크기는 140–210px. 본문 중앙에 꽃이나 강한 무늬를 배치하지 않는다.
- 프레임과 꽃 의사 요소는 pointer-events:none으로 설정한다. 장식을 접근성 트리에 추가하지 않는다.
- Hero 사진은 기존 설정 이미지를 유지하고 아치형 마스크, 얇은 테두리, 최대 높이 340px을 적용한다. 사진 숨김 설정도 그대로 지원한다.
- 갤러리는 기존 lazy loading과 오류 대체 UI를 유지한다. CSS 장식은 lazy loading 대상이 아니며 단일 파일을 재사용한다.
- URL은 CSS 파일 기준 상대경로를 사용해 `/wd_letter/` 배포를 지원한다.

## 공통 컴포넌트

| 컴포넌트 | Floral 규칙 |
| --- | --- |
| 일반 버튼 | 아이보리 바탕, 청회색 1px 테두리, 2px 모서리 |
| 주요 버튼 | 짙은 청회색 바탕과 흰 글자 |
| 카드 | 4px 모서리, 얇은 테두리, 아주 약한 그림자 |
| 입력 | 3px 모서리, 16px 글자, 기존 오류·비활성 상태 유지 |
| 구분선 | 내부는 세이지 회색 실선, 섹션 간 기존 구분선 대신 종이 프레임 |
| 갤러리·모달 | 같은 표면·글자·테두리 토큰 사용, 원래 키보드 및 터치 동작 유지 |
| 지도·계좌·연락처 | 장식 프레임 안에 기존 카드 배치, 긴 주소·번호 줄바꿈 유지 |
| 푸터 | 동일 수채화 장식을 작게 사용 |

## 접근성 및 반응형

- 조작 요소 최소 높이 44px, 키보드 포커스 3px, 장식은 클릭을 가로채지 않는다.
- 초대 문구 줄바꿈, 폼 라벨, 라이브 상태 안내, 이미지 대체 텍스트를 유지한다.
- 기존 Hero 1회 페이드인만 유지하고 prefers-reduced-motion을 존중한다.
- 320 / 375 / 430 / 768 / 1440px에서 가로 넘침과 8개 섹션 표시를 확인한다.
- 샘플 캡처: `docs/qa/floral-watercolor-375.jpg`, `docs/qa/floral-watercolor-invitation-375.jpg`.

## 장식 제작 기록

내장 image_gen으로 제작한 투명 PNG를 프로젝트에 복사했다. 생성 프롬프트: “Production website decorative asset, transparent background; delicate botanical watercolor L-shaped lower-left arrangement, dusty powder-blue anemone with dark blue stamens, pale blue forget-me-not flowers, muted sage leaves and fine stems; upper-right two thirds transparent; traditional hand-painted pigment blooms; palette #B7CDDE #7899B5 #A9B6AC; no text, border, shadow or watermark.” 종이 질감과 테두리는 SVG/CSS로 구현했다.

## Ticket — 보딩패스 디자인

`wedding-ticket`은 푸른 꽃을 사용하지 않는 네이비 티켓 테마다. 원안은 크림(#FCF1D0)이며 현재 파일에서 변경된 민트(#FFF3E3)를 유지한다. `css/themes/ticket.css`에 토큰과 전용 테두리를 분리하며 모든 선택자는 해당 data-theme 아래로 한정한다. 기존 HTML, 설정 콘텐츠, 섹션 초기화 함수는 공유한다.

| 토큰 / 역할 | 색상 |
| --- | --- |
| primary / heading / action — 제목·주요 버튼 | #010736 |
| background — 바깥 배경, text — 본문 | #0D1C42 |
| secondary / muted / border / focus — 보조 글자·선 | #22396F |
| surface / soft / accent / on-action / on-overlay — 티켓 종이·버튼 글자 | #FFF3E3 |

- 항공권·공항 안내판 느낌의 타이포그래피(2026-11-08): `--font-ticket`은 Share Tech Mono → Courier New → 한글 시스템 고딕 → monospace. `--font-display`도 이 토큰을 사용한다. 영문 제목과 숫자는 고정폭으로, 한글 이름과 제목은 맑은 고딕/Apple SD Gothic Neo로 표시한다. 제목 22.4–32px, 자간 .04em.
- 제목 전용 `--font-title`은 티웨이항공체(Tway Air) → 한글 시스템 고딕 → sans-serif. Hero 제목(h1), 섹션 제목(h2), 상단 브랜드에 적용하며 굵기는 400이다. 브랜드는 16–20px, 대문자, 자간 .08em. 티웨이항공체는 `ticket.css`의 @font-face에서 jsDelivr WOFF를 display=swap으로 로드하며 실패 시 시스템 고딕으로 표시한다.
- 티켓 보조 제목은 Share Tech Mono, 12px, 자간 .18em, 기본 굵기 400. Hero 날짜와 달력 숫자의 고정폭 글꼴은 유지한다. `--font-display`와 제목 전용 토큰을 분리해 날짜와 본문의 글꼴은 바꾸지 않는다.
- 초대 문구·주소·폼·버튼 등 본문은 시스템 고딕으로 가독성을 유지한다. 초대 문구 줄간격 2.3. Google Fonts는 display=swap으로 로드하며, 실패하면 시스템 대체 글꼴을 사용한다. 글꼴 규칙은 Ticket에만 적용한다.
- 실제 이름·제목·날짜는 설정을 그대로 사용한다. 샘플의 영문 이름·항공편 번호·가상 날짜를 하드코딩하지 않는다.
- 바깥 섹션 여백 24–48px, 가로 여백 16–28px. 티켓 내부 위 56px, 아래 72px, 좌우 24–48px.
- Hero는 이중 실선과 모서리 노치, 다른 섹션은 반복 반원 펀칭과 안쪽 점선. 배경 그라데이션으로 펀칭을 표현하여 콘텐츠와 포커스 링을 잘라내지 않는다.
- Hero 하단은 절취선과 장식 바코드로 분리한다. 기존 대표 사진도 티켓 안에 유지하고 최대 높이 320px을 적용한다.
- 카드 테두리는 점선, 입력 모서리는 2px, 버튼은 3px. 주요 버튼은 네이비 바탕과 민트 글자.
- 네이비 바깥 영역인 헤더·푸터는 민트 글자와 포커스 링을 사용한다. 모달과 폼은 민트 표면·네이비 글자를 사용한다.
- 갤러리, 지도, 계좌, 연락처, 방명록에도 동일한 티켓 패널과 공통 토큰을 적용한다.

### Ticket 장식 파일

`assets/images/templates/ticket/`의 작은 코드 기반 SVG를 사용한다. 추가 이미지 생성이나 런타임 의존성은 없다.

- `flight.svg`: 점선 항로·비행기. Hero와 푸터 장식.
- `stamp.svg`: 원형 비행기 스탬프. 공통 섹션 장식.
- `barcode.svg`: 스캔 기능이 없는 장식용 바코드. Hero 절취선 아래에 배치.

장식은 CSS 배경/의사 요소로만 표시하고 접근성 이름이나 의미 있는 콘텐츠로 사용하지 않는다. 상대 경로는 GitHub Pages의 `/wd_letter/`에서도 동작한다.

## 세 템플릿 비교

| 항목 | Floral | Sketch | Ticket |
| --- | --- | --- | --- |
| ID | wedding-floral | wedding-sketch | wedding-ticket |
| 분위기 | 수채화·아이보리·푸른 꽃 | 블루·민트 펜선·크림 종이 | 네이비·민트·여행 티켓 (원안 크림) |
| 테두리 | 아치와 섬세한 이중선 | 손으로 그린 루프 곡선 | 펀칭·절취선·이중선 |
| 장식 | 투명 수채화 PNG | 부케·반지·리본 SVG | 비행기·스탬프·바코드 SVG |
| 공통 | 설정 기반 콘텐츠, 8개 섹션, 키보드 접근성, reduced-motion, 44px 조작 영역 | 동일 | 동일 |

2026-11-07 브라우저 검증: Ticket은 320·375·430·768·1440px 모두 8개 섹션이 표시되고 가로 넘침이 없었다. 시각 변경은 DOM 재생성 없이 적용되므로 폼 입력과 갤러리 상태를 유지한다.


## Ticket 완료 검증 — 2026-11-07

- 전용 스타일: `css/themes/ticket.css`. 그림: `assets/images/templates/ticket/`의 flight.svg, stamp.svg, barcode.svg.
- Ticket 선택 시 templateId는 wedding-ticket. 나머지 두 테마도 설정 및 applyTheme으로 선택 가능.
- 설정 정규화의 세 ID 허용, 테마 전환·폴백·theme-color 갱신 및 기존 기능 테스트 통과. 테마 함수는 섹션 DOM을 재생성하지 않는다.
- 루트 및 /wd_letter/ 하위 경로의 모듈·CSS·장식 이미지 응답 테스트 통과.
- 실제 브라우저에서 갤러리 열기, 다음 이미지(2/3), ESC 닫기, 스크롤 잠금 해제와 썸네일 포커스 복원 확인.
- 캡처: [첫 화면](qa/ticket-hero-375.jpg), [초대 문구](qa/ticket-invitation-375.jpg).
- 외부 지도·카카오 공유 운영 확인은 기존 배포 체크리스트의 별도 항목이다. 이번 작업에서 외부 등록·전송·배포는 하지 않았다.

Ticket 비행기 장식은 제공된 이륙·착륙 측면 실루엣과 활주로 선을 기준으로 SVG로 재작성했다. flight.svg는 이륙/착륙 한 쌍, stamp.svg는 이륙 아이콘을 사용하며 기존 네이비 색상과 투명 배경을 유지한다.



## Sketch 개편 — 2026-11-07

참고 이미지의 펜으로 그린 곡선 테두리, 웨딩 소품과 연결되는 필기체를 반영했다. 기존 8개 섹션과 데이터, 다른 테마는 유지한다.

| 역할 | 값 |
| --- | --- |
| 종이 / 카드 | #FAF5E9 / #FFFAF0 |
| 블루 장식 / 민트 테두리 | #758FC1 / #9EC9B2 |
| 본문 / 보조 안내 | #394D68 / #536681 |
| 제목 / 주요 버튼 | #536E9B / #4F6B98 |
| 버튼 hover / 선택 바탕 | #3D567E / #E5EEE4 |

- 한글 제목·이름·초대 문구·예식 날짜 및 시간: 마루부리(MaruBuri). 네이버 공식 WOFF2의 Regular(400), Bold(700)를 사용하며 font-display: swap으로 로딩한다. 마루부리 텍스트는 기존 대비 약 10% 축소한다. Hero 제목 28.8–40px, 초대 문구 18.72–22.4px 및 줄간격 1.85. Wedding Day 날짜와 시간은 모든 템플릿에서 기존 시간 크기인 1.0625rem(기본 17px)으로 통일한다. 달력 내부의 월·요일·날짜 글씨 크기는 유지한다. 폰트 출처: https://hangeul.naver.com/font
- 영문 브랜드·섹션 보조 제목: Allura → Segoe Script → cursive. 보조 제목은 CSS로 소문자 표시하고 설정 원문은 유지한다.
- 주소·날짜·계좌·전화번호·폼은 가독성을 위해 기존 시스템 본문 글꼴을 유지한다. 장식의 연한 색상을 본문에 사용하지 않는다.
- 섹션 패널 내부 위 60px, 아래 72px, 좌우 38–68px. 359px 이하 좌우 32px. 본문과 곡선의 겹침을 피한다.
- 카드·버튼·사진 모서리는 서로 다른 타원 반지름으로 부드럽게 그린 형태를 표현한다. 짙은 블루 포커스, 44px 조작 영역과 reduced-motion 규칙을 유지한다.
- `assets/images/templates/sketch/curve-frame.svg`: 루프가 있는 민트 곡선 프레임. 비율이 바뀌어도 선 두께를 유지하는 non-scaling-stroke 사용.
- `bouquet.svg`: 부케와 리본. Hero·갤러리·푸터 장식.
- `rings.svg`: 다이아몬드 반지와 하트. 공통 섹션 장식.
- `ribbon.svg`: 손그림 리본. 초대 문구·방명록 장식.
- `paper.svg`: 크림색 종이 질감. 기존 flowers.svg는 보존하지만 현재 테마에서 사용하지 않는다.
- 모든 장식은 CSS 의사 요소/배경이며 pointer-events:none을 적용해 조작을 가로채지 않는다. 새 이미지/폰트 런타임 의존성은 추가하지 않았다.

## 예식 정보 배치와 달력

Hero에는 weddingInfo.venue를 `- 웨딩홀 이름 -` 형태로 표시하고, 그 아래 basic.weddingDate를 YYYY.MM.DD로 표시한다. 두 줄 모두 13px 시스템 글꼴, 자간 .16em, 줄간격 1.7로 간결하게 정렬한다. 시간은 예식 정보에, 주소는 오시는 길에 표시하며 설정 키는 유지한다. 웨딩홀 이름이 비어 있으면 해당 줄만 숨긴다.

wedding-info의 기존 장소 카드에는 basic.weddingDate 기준 월간 SVG 달력을 표시한다. 선택 날짜는 테마 action 색상의 원과 on-action 글자로 강조하고, 예식 시간과 D-day는 유지한다. 달력은 고해상도에서도 선명하며 역할(img)과 한국어 대체 설명을 제공한다. 연·월·요일·윤년 계산은 방문자 시간대에 영향받지 않는다.


## 공통 섹션 너비 — 2026-11-08 완료

모든 테마의 8개 섹션 패널은 `--content-width: 560px` 하나를 기준으로 한다. Hero 480px, Invitation 520px 등 섹션별 최대 너비를 제거했다. 공통 `.section-inner`는 width:100%, max-width:var(--content-width), min-width:0 및 가운데 정렬을 사용한다.

- 작은 화면: 화면에서 좌우 page-gutter를 제외한 공간에 맞춰 자동 축소한다.
- 태블릿·데스크톱: 모든 섹션 패널을 최대 560px로 동일하게 정렬한다.
- 좌우 여백은 safe-area-inset도 고려한다. 가로 스크롤을 숨겨 잘림을 감추는 방식은 사용하지 않는다.
- Sketch의 내부 여백은 38–68px로 조정해 넓어진 패널의 곡선 테두리와 콘텐츠 간격을 확보한다. 359px 이하에서는 기존 32px을 유지한다.
- 달력·버튼·카드 등의 내부 요소는 용도에 맞는 최대 너비를 유지한다. 달력 카드의 좌우 추가 여백 12px과 최대 너비 360px, 달력 SVG 최대 너비 280px도 유지한다.

브라우저 확인 결과(현재 Sketch, 스크롤바가 있는 환경):

| 뷰포트 | 8개 패널 너비 | 가로 넘침 / 화면 밖 콘텐츠 |
| --- | --- | --- |
| 320px | 모두 273px | 없음 |
| 375px | 모두 328px | 없음 |
| 430px | 모두 약 380px | 없음 |
| 768px | 모두 560px | 없음 |
| 1024px | 모두 560px | 없음 |
| 1440px | 모두 560px | 없음 |

표의 작은 화면 실측 너비는 브라우저 스크롤바 유무에 따라 달라질 수 있다. 공통 너비 규칙은 Floral과 Ticket에도 적용하며 테마별 장식은 유지한다.

## 지도 앱 버튼

장소찾기 버튼은 지도 바로 아래, 교통·주차 안내 위에 배치한다. assets/images/logo의 kakao_map.png와 naver_map.png를 24px로 표시하고, 글자는 카카오맵·네이버지도로 간소화한다. 버튼은 콘텐츠 너비에 맞추고 12px 글자와 작은 여백을 사용하며, 터치 영역은 최소 44px을 유지한다. 좁은 화면에서는 줄바꿈하고 이미지 로딩 실패 시에도 텍스트 링크를 유지한다.

## 오시는 길 상세 안내

location.car / transport / subway / parking은 각각 visible, title, text를 가진다. 자차 text가 비어 있으면 weddingInfo의 장소명·주소로 안내를 생성한다. 나머지 빈 문구 또는 visible:false 항목은 숨긴다. text의 줄바꿈을 유지한다. 노선·출구·무료 주차 시간은 실제 확인한 정보로 설정에서 교체한다.

네 행은 아이콘 + 제목 + 본문 구조이며 기본 아이콘 48px, 430px 이하 36px을 사용한다. Floral은 옅은 원형, Sketch는 불규칙 민트 테두리, Ticket은 네이비 이중선 스탬프를 적용한다. SVG 아이콘은 장식으로 처리하고 제목으로 의미를 전달한다. 대중교통의 기존 transport 및 parking 설정 키는 유지한다.

## 고인 표시 국화 아이콘 — 2026-11-08

참고 이미지처럼 크기가 다른 흰 국화 두 송이를 우측 상단과 좌측 하단에 대각선으로 포갠 SVG로 재구성한다. 작은 꽃은 큰 꽃의 69% 크기이며 꽃잎은 모두 흰색, 줄기·잎은 대비가 선명한 초록색으로 표현한다. 각 테마의 `assets/images/templates/{theme}/memorial-chrysanthemum.svg`를 사용한다.

- Floral: 흰 꽃잎, 부드러운 세이지 윤곽, 짙은 초록 잎.
- Sketch: 둥글게 휘어진 흰 꽃잎과 파란 펜 윤곽, 부드럽게 굽은 줄기, 곡선 가장자리의 초록 잎과 잎맥. 크기가 다른 두 송이의 대각선 구도를 유지한다.
- Ticket: 흰 꽃잎을 강조하는 얇은 네이비 점선 윤곽(선 두께 .45, 점선 .8/1.6, 선 불투명도 55%), 짙은 초록 잎. 꽃잎 채움은 불투명한 흰색을 유지한다.

공통 크기는 36×40px이며 이름 앞에 4px 간격으로 배치한다. `--memorial-flower-image` CSS 변수로 교체하므로 templateId 변경 시 DOM을 다시 만들지 않는다. 아이콘은 role=img, aria-label=고인으로 안내한다. fatherDeceased/motherDeceased 옵션과 이름이 있을 때만 표시한다.


### Floral 국화 수채화 적용

Floral은 `assets/images/templates/floral/memorial-chrysanthemum-watercolor.png`의 투명 배경 수채화 이미지를 사용한다. 흰 국화 두 송이의 대각선 구도와 선명한 초록 잎, 부드러운 아이보리·세이지 음영을 적용했다. Sketch·Ticket은 기존 SVG를 유지한다. 표시 크기(36×40px), 접근성 안내, 고인 옵션은 동일하다.

Floral·Sketch·Ticket의 표시 크기는 부모님 이름 글자 크기를 기준으로 1.5em × 1.7em(16px 글씨 기준 약 24×27px)로 맞춘다. 이름과의 가운데 정렬은 유지한다.

제작: 내장 image_gen 도구. 프롬프트 요약: 투명 배경에 큰 흰 국화는 우측 상단, 작은 흰 국화는 좌측 하단에 겹쳐 배치하고, 짙은 초록 잎과 짧은 줄기를 섬세한 수채화 질감으로 표현한다. 검은 윤곽선·텍스트·워터마크는 제외한다.

## 계좌 안내 아코디언 — 2026-11-08

신랑 측·신부 측의 details/summary 패널 안에 계좌 카드를 배치한다. 접힌 헤더는 최소 60px 높이이며 펼침 상태에 따라 꺾쇠 방향이 바뀐다. 카드는 관계/예금주 헤더와 은행/계좌번호/복사 아이콘 행으로 구성한다. 내용 폭은 줄어들 수 있고 긴 계좌번호와 이름은 줄바꿈한다. 배경·선·모서리·그림자는 각 테마 토큰을 공유하고 Ticket 패널은 점선 테두리를 사용한다. 복사 버튼은 44px 이상이며 기존 focus-visible 표시를 유지한다.

## 배경음악 버튼

헤더 바로가기 메뉴는 제거하고 세 템플릿 모두 헤더 우측에 44×44px 음악 아이콘 버튼을 배치한다. 정지 상태에는 사선이 있는 스피커, 재생 중에는 음파가 있는 스피커를 표시한다. Floral은 가는 선과 은은한 채움, Sketch는 살짝 기울인 펜 선화, Ticket은 채워진 스피커와 단정한 선을 사용한다. 배경과 테두리는 없이 헤더 글자색을 사용하며 툴팁과 aria-label로 동작을 안내한다. music.key가 비어 있거나 등록된 활성 음원이 없거나 music.visible이 false이면 숨긴다. 자동 재생하지 않으며 토글의 aria-pressed와 접근성 이름을 상태에 맞게 갱신한다.

## Hero 이미지 반짝임

대표 이미지 위에 작은 별빛 6개를 서로 다른 시점에 약 5.6초 주기로 부드럽게 표시한다. 장식은 aria-hidden 및 pointer-events:none으로 처리하며 사진 중앙의 인물을 가리지 않도록 주변에 배치한다. prefers-reduced-motion 설정에서는 장식을 숨긴다. 이미지 미설정·숨김·로딩 실패 시 사진과 장식을 함께 숨긴다. 공통 hero-media 구조를 사용하므로 세 템플릿에 동일하게 적용한다.

## 하단 섹션 Fade up

Account·Contact·Guestbook의 section-inner는 화면에 처음 들어올 때 24px 아래에서 700ms 동안 올라오며 나타난다. IntersectionObserver로 섹션마다 한 번 실행하며, 테마와 무관하게 공통 적용한다. 기본 콘텐츠는 숨기지 않고 관찰 API 미지원 환경에서도 표시한다. 동작 줄이기 설정과 키보드 포커스가 들어간 경우 애니메이션을 생략한다.

## Sketch 이중 펜 프레임 — 2026-11-09

각 섹션의 바깥 곡선 테두리를 샘플 형태의 부드러운 파스텔 블루(#91a8cc) 이중 프레임으로 변경했다. 외곽은 살짝 흔들리는 사각형, 안쪽은 모서리가 안으로 둥글게 들어간 선이며 네 모서리에 작은 하트를 배치한다. 위·아래 중앙은 양쪽 화살표와 짧은 곡선으로 장식한다.

`double-frame.svg`를 border-image(48 slice / 36px width)로 나누어 표시하므로 갤러리·방명록처럼 길어지는 섹션에서도 하트와 모서리가 세로로 늘어나지 않는다. 화살표는 `frame-arrow.svg`를 별도 배경으로 표시한다. 기존 내부 여백과 pointer-events:none을 유지한다. 이전 curve-frame.svg는 사용하지 않는다.

## 공통 제목 크기 — 2026-11-10

모든 템플릿의 Hero 제목(h1)과 섹션 제목(h2)은 공통 토큰 --font-size-heading: clamp(1.12rem, 4vw, 1.6rem)을 사용한다. 기존 Floral·Ticket 제목 크기를 기준으로 약 20% 축소했으며, 이전 테마별 제목 크기 명세보다 이 규칙을 우선한다. 테마별 글씨체와 본문·달력 크기는 유지한다.

## Marble & Gold — wedding-marble

흰색·연회색의 무채색 대리석 일러스트 바탕, 모서리가 잘린 금색 이중 프레임, 보석과 잎사귀의 금색 포인트를 사용하는 템플릿이다. config/wedding.config.js의 templateId를 wedding-marble로 지정하며, HTML 재생성 없이 기존 8개 섹션과 기능에 적용된다.

- 컬러: 배경 #F5F5F5, 패널 #FAFAFA, 본문 #423E38, 제목 #53422C, 버튼·링크 #7D5B24. 금속 장식은 #A66C22–#F0D888 그라데이션이며 작은 텍스트에는 가독성을 위해 어두운 골드 색상을 사용한다.
- 서체: 한글 제목·이름은 Noto Serif KR, 영문 장식 문구와 브랜드는 Allura. 제목 및 Wedding Day 날짜·시간 크기는 공통 규칙을 그대로 사용한다.
- 여백: 섹션 외부 24–48px, 패널 내부 상단 58px / 좌우 30–52px / 하단 64px. 공통 최대 너비 및 모바일 안전 여백을 따른다.
- 프레임: frame.svg의 64 slice / 38px border-image로 긴 섹션에서도 모서리 비율을 유지한다. 테두리는 클릭과 키보드 포커스를 방해하지 않는다.
- 장식: assets/images/templates/marble/marble-texture.png(사용자가 제공한 흰색·회색 대리석 텍스처), frame.svg(이중 금색 프레임), ornament.svg(보석·잎사귀). 배경은 원본 비율을 유지하여 패널 너비에 맞추고 세로로 반복한다. 프레임과 포인트 장식은 SVG로 선명하게 표시한다.
- 버튼·입력·계좌·연락처·방명록: 밝은 아이보리 표면과 얇은 금색 테두리, 짙은 골드 액션 색상. Hero 이미지에는 금색 사진 프레임을 적용한다.
- 효과와 접근성: 기존 반짝임, fade-up, reduced-motion, 포커스 표시를 유지한다. 장식은 가상 요소로 표시한다.

## Autumn Watercolor — wedding-autumn

샘플의 여백과 수채화 붓자국을 가을 웜톤으로 해석한 템플릿이다. templateId: wedding-autumn으로 선택하며 기존 8개 섹션과 렌더링 구조를 유지한다.

- 색상: 오트밀 배경 #F5EDE4, 크림 패널 #FFFCF7, 살구 #D7A88D, 옅은 올리브 #B7B293, 테라코타 액션 #85563E, 본문 #55463C. 밝은 장식 색상과 읽기 쉬운 짙은 텍스트를 구분한다.
- 서체: 기존 한글 명조체 영역은 HS가을생각체 2.0, 영문 포인트와 브랜드는 Cormorant Garamond Italic을 사용한다. 웹폰트는 font-display: swap으로 표시한다. 제목·날짜·시간·달력 크기는 공통 디자인 시스템을 따른다. 한글 폰트 배포 정보: https://noonnu.cc/font_page/735 / 영문: https://fonts.google.com/specimen/Cormorant+Garamond
- 배경 및 포인트: imagegen으로 제작한 watercolor-leaves.png를 assets/images/templates/autumn에 저장한다. 단풍·참나무·은행잎과 작은 하트가 들어간 투명 수채화 일러스트를 상단 우측과 하단 좌측에 배치한다. 상단 장식은 55% 불투명도로 표시한다.
- 레이아웃: 패널 상단 76px, 좌우 26–46px, 하단 104px. 얇은 웜 베이지 테두리와 넉넉한 중앙 여백, 옅은 살구색 붓자국을 사용한다. 장식은 포인터 입력을 받지 않는다.
- 구성 요소: 부드러운 모서리의 아이보리 카드·버튼, 웜 베이지 테두리, 살구색 교통 아이콘 바탕. 계좌·연락처·방명록·갤러리·지도·BGM은 공통 기능을 그대로 사용한다.
- 접근성: 기존 키보드 포커스와 동작 줄이기 설정을 유지한다. 텍스트는 이미지에 넣지 않고 설정 파일에서 렌더링한다.

## 축하연락하기 모달 — 2026-11-12

독립 Contact 섹션은 제거하고 Invitation 가족 소개 아래의 버튼으로 이동했다. contact.title은 버튼과 모달 제목에 함께 사용한다. 연락처는 신랑·신랑 아버지·신랑 어머니 / 신부·신부 아버지·신부 어머니 순으로 배치하며 각 행에 전화·문자 아이콘을 제공한다. 다섯 템플릿의 표면·색상·테두리 토큰을 공유한다.

설정은 config/wedding.config.js의 contact.items에서 관리한다. 각 항목은 visible: true와 유효한 phone이 있어야 표시된다. 부모님은 기본 비활성화이며 person(groomFather, groomMother, brideFather, brideMother)에 따라 Invitation 부모님 이름을 가져온다. name을 입력하면 그 이름이 우선한다. 번호 자체를 공개 파일에 두지 않으려면 비활성화뿐 아니라 phone도 비워 둔다.

네이티브 dialog를 사용하여 키보드 포커스를 모달에 제한한다. 닫기 버튼·ESC·배경 클릭으로 닫으며, 배경 스크롤과 기존 인라인 스타일 및 버튼 포커스를 복원한다. 전화·문자 아이콘은 44px 터치 영역과 대상별 접근성 이름을 제공한다. 공개 연락처가 없거나 Invitation/Contact가 비활성화되면 버튼도 숨긴다. Account·Guestbook의 fade-up은 유지한다.

## 테마별 Hero 이미지 효과 — 2026-11-12

Hero 이미지의 장식 레이어를 공유하고 테마 CSS로 효과를 선택한다. 이미지가 숨겨지거나 로딩에 실패하면 효과도 함께 숨긴다. 장식은 aria-hidden 및 pointer-events:none으로 콘텐츠 접근과 터치를 방해하지 않는다.

- Autumn: 8–18px 크기의 낙엽 12개가 12–18초 주기로 좌우로 흔들리며 내려온다. 살구·황토·올리브 색상과 단풍/타원 잎 모양을 사용한다.
- Ticket: 사진 하단에 이미지 너비에 맞춘 낮고 넓은 필기체 소문자 l 고리 경로로 작고 둥근 비행기가 움직인다. SVG viewBox 좌표 기반으로 화면 크기에 비례하며, 12초 주기와 페이드 휴지 구간을 사용한다.
- Marble: 기존 공통 반짝임을 유지한다. 추가 금박 효과는 제거했다.
- Sketch: 기존 공통 반짝임을 유지한다. 추가 색종이 효과는 제거했다.
- Floral: 기존 꽃잎 효과를 유지한다. 모든 효과는 이미지 안에 한정하고 prefers-reduced-motion: reduce에서는 숨긴다.

## 공통 화면 너비 — 2026-11-14

모든 템플릿의 헤더·main·section·section-inner는 width:100%, max-width:448px로 표시한다. --content-width는 448px이며 넓은 화면에서는 중앙 정렬한다. 섹션 바깥의 좌우 gutter를 제거하여 448px 이하 화면에서는 전체 너비를 채운다. 템플릿별 내부 패딩과 기기의 safe-area 여백은 유지한다. 갤러리 확대 모달은 기존 크기를 유지한다. 이전 너비 명세보다 이 규칙을 우선한다.

## 헤더 제거 및 음악 버튼 고정 — 2026-11-14

모든 템플릿의 사이트 헤더와 브랜드 문구를 제거한다. 음악 버튼은 body 바로 아래에 두고 position:fixed로 화면 우측 상단 12px에 고정하며 safe-area를 반영한다. 44px 터치 영역, 테마별 스피커 아이콘, 표면 배경과 액션 색상을 사용한다. 스크롤 중에도 표시하며 모달이 열리면 네이티브 dialog 아래에 위치한다. 음원 미설정 시 숨김 및 재생/정지 로직은 유지한다. Hero의 헤더 높이 차감도 제거한다.

## 섹션 연속 배치 — 2026-11-14

모든 템플릿의 --section-space는 0px이며 섹션의 바깥 세로 여백을 없앤다. Hero의 별도 상하 패딩과 화면 높이 최소값을 제거해 첫 패널 뒤에도 빈 공간이 생기지 않도록 한다. 각 템플릿의 section-inner 패딩과 프레임·장식은 유지한다. 이전 섹션 외부 여백 명세보다 이 규칙을 우선한다.

## Floral Hero 배경 사진 — 2026-11-14

Floral Hero의 대표 사진은 별도 카드 대신 바깥 아치 프레임(inset:0, 섹션 전체 너비) 안을 채운다. 기존 img와 설정 경로를 유지하고 object-fit:cover로 비율을 보존한다. 사진 위에는 밝은 그라데이션을 겹쳐 상단 제목과 하단 이름·예식 정보의 가독성을 확보한다. 꽃잎·반짝임은 동일한 아치 안에 표시한다. 사진이 없거나 실패하면 기존 숨김 처리를 유지하며 다른 템플릿에는 적용하지 않는다.

Floral Hero의 프레임과 사진 사이 외부 간격은 0으로 맞춘다. 사진 위 텍스트의 가독성을 위한 내부 여백은 유지한다. 꽃 장식은 하단에서 제거하고 상단 양 모서리에 배치한다. 이름은 웨딩홀과 같은 --font-body/400을 사용하며 기존 크기의 70%인 clamp(.98rem, 3.5vw, 1.295rem)로 표시한다. 이름 사이 하트는 Floral에서만 18px 파스텔 블루 꽃(name-flower.svg)으로 대체하며 다른 템플릿은 유지한다.

## Floral 장식·서체 정리 — 2026-11-14

모든 섹션의 모서리 꽃 장식과 Hero 이름 사이의 장식 꽃을 제거한다. 고인 표시 국화꽃은 의미 전달용 아이콘이므로 유지하며, 기존 Hero 꽃잎 애니메이션은 별도 효과로 유지한다. Hero 외 섹션 프레임도 inset:0으로 공통 최대 너비 448px에 맞춘다. 한글·숫자는 --font-body와 --font-display를 MaruBuri로 통일하고 영문 장식 서체는 유지한다. MaruBuri 웹폰트 선언은 공통 variables.css에서 Floral/Sketch가 공유한다.

## Invitation 사진 소개 카드 — 2026-11-14

초대글 아래에 신랑·신부 소개를 두 열로 배치한다. 각 카드는 3:4 사진, 역할과 이름, 부모님 및 관계 설명 순서다. 320px 화면에서도 열이 넘치지 않도록 minmax(0,1fr)와 줄바꿈을 적용한다. 하나의 카드만 공개하면 가운데 정렬한다. 축하연락하기 버튼은 카드 아래에 유지한다.

config/wedding.config.js의 invitation.parents 각 항목에서 설정한다.

- image: { visible: true, src: "./assets/images/portraits/groom.jpg", alt: "신랑 사진" }. 실제 사진을 해당 위치에 저장한 뒤 src를 지정한다. 신부도 같은 방식으로 설정한다. 예시 파일은 포함되지 않으며 현재 src는 비어 있다.
- image.visible: false이면 사진 영역 없이 소개만 표시한다. src가 비었거나 로딩에 실패하면 사진 영역에 대체 안내를 표시한다.
- father, mother, relation: 부모님 이름과 장남·장녀 등의 관계를 입력하면 “홍OO · 김OO의 장남”처럼 조합한다. fatherDeceased/motherDeceased 고인 표시도 유지한다.
- description: 선택 사항. 입력하면 자동 부모님/관계 문구 대신 자유 설명을 표시하며 줄바꿈을 유지한다. 고인 아이콘이 필요한 경우 자동 문구 방식을 사용한다.
- 이름은 basic.groomName/brideName과 연결하며 person으로 구분한다. 카드 전체 숨김은 기존 visible 옵션을 사용한다.

사진은 lazy loading과 고정 비율로 로딩 중 레이아웃 이동을 줄인다. 사용자 문구는 textContent로 삽입한다. 5개 템플릿 모두 동일한 DOM을 사용하고 각 테마의 서체·색상·모서리 스타일을 따른다.

## 소개 카드 사진 자동 전환 — 2026-11-14

invitation.parents의 각 항목에 images 배열을 추가하면 신랑·신부별로 여러 사진을 지정할 수 있다. 예: images: [{ src: "./assets/images/portraits/groom-1.jpg", alt: "신랑 사진 1" }, { src: "./assets/images/portraits/groom-2.jpg", alt: "신랑 사진 2" }]. 배열이 없으면 기존 image.src를 사용한다. image.visible은 사진 영역 전체 표시 여부, images 각 항목의 visible은 해당 사진의 표시 여부다.

첫 사진은 즉시 표시하고 로딩 완료된 다음 사진을 5초마다 4초 페이드로 전환한다. 페이드가 끝난 뒤 약 1초간 사진을 유지하고 다음 전환을 시작한다. 실패한 사진은 건너뛰며 모든 사진 실패 시 대체 안내를 표시한다. 카드의 일시정지/자동재생 버튼은 표시하지 않는다. 백그라운드 탭과 동작 줄이기 설정에서는 자동 전환을 멈춘다. 재렌더링 시 타이머와 이벤트를 해제한다. 단일 사진은 전환하지 않는다.

## 전체 섹션 스크롤 등장 — 2026-11-14

main 바로 아래 모든 공개 섹션(Hero, Invitation, Wedding Day, Location, Gallery, Account, Guestbook)에 공통 fade-up을 적용한다. 화면 안으로 48px 들어오면 24px 아래에서 700ms 동안 올라오며 한 번 나타난다. 숨긴 섹션은 제외하고 동작 줄이기 설정 및 키보드 포커스 진입 시 애니메이션을 생략한다. 관찰 API 미지원 시에도 콘텐츠를 숨기지 않는다. 이후 추가되는 섹션에도 같은 규칙이 적용된다.

## Floral 교대 테두리 — 2026-11-14

Floral의 표시되는 섹션은 첫 번째부터 단선과 이중선을 번갈아 적용한다. hidden 섹션은 순서에서 제외한다. 기본은 1px 단선이며 짝수 번째 공개 섹션은 안쪽 4px 위치에 선을 추가한다. Hero 아치와 Invitation 직선 형태, 전체 너비 및 내부 콘텐츠 여백은 유지한다.
