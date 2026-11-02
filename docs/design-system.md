# 청첩장 디자인 시스템

| 항목 | wedding-floral | wedding-sketch |
| --- | --- | --- |
| 배경 | 아이보리 #faf9f3 | 흰색 #ffffff + 종이 질감 |
| 장식 | 파스텔 블루 #afc8d9, 세이지 #b9ccba 수채화풍 꽃 | 흑백 손그림 꽃과 하트 |
| 제목 | Noto Serif KR, 명조 대체 폰트 | Nanum Pen Script, 손글씨 대체 폰트 |
| 본문 | 시스템 한글 고딕, 줄간격 1.9 | 시스템 한글 고딕, 줄간격 1.9 |
| 섹션 여백 | 80–128px | 64–104px |
| 버튼 | 세이지 계열 짙은 녹색, 알약형 | 검정, 비대칭 모서리와 작은 그림자 |
| 카드 | 20px 둥근 모서리, 부드러운 그림자 | 작은 비대칭 모서리, 얇은 검정 계열 테두리 |
| 구분선 | 72px 세이지 실선 | 56px 회색 점선 |

## 파일 역할
- css/variables.css: 공통 토큰 계약과 floral 기본값. 간격 눈금은 4/8/12/16/24/32/48px.
- css/common.css: 본문, 제목, 포커스 및 공통 텍스트.
- css/layout.css: 페이지 구조, 섹션 여백, 장식 배치, 구분선, 모달 및 반응형.
- css/components/sections.css: 섹션 내부 구성요소.
- css/components/buttons.css: 버튼과 hover/active/disabled 상태.
- css/themes/floral.css, sketch.css: 루트에 적용되는 테마 변수만 선언.
- assets/images/templates/floral/flowers.svg: SVG 필터로 표현한 수채화풍 꽃.
- assets/images/templates/sketch/flowers.svg, paper.svg: 선화와 반복 종이 질감.

장식은 CSS 의사 요소로 표시하여 콘텐츠나 접근성 트리에 추가하지 않습니다.
모든 섹션과 푸터가 같은 장식·타이포·간격·구분선 규칙을 공유합니다.
버튼은 최소 44px 높이를 유지하고, 키보드 포커스 및 동작 줄이기 설정을 지원합니다.

## 템플릿 전환
최초 테마는 config/wedding.config.js의 templateId로 선택합니다.

런타임 전환은 기존 함수를 호출합니다:
```js
import { applyTheme } from "./js/core/theme.js";
applyTheme("wedding-sketch");
applyTheme("wedding-floral");
```

applyTheme은 html의 data-theme과 브라우저 theme-color만 변경합니다.
섹션 초기화 함수를 다시 호출하지 않으므로 노드, 입력값, 이벤트 리스너, 갤러리 상태가 유지됩니다.
지원하지 않는 ID는 wedding-floral로 돌아갑니다.
두 CSS는 항상 로드되며 HTML을 새로 만들거나 스타일시트를 교체하지 않습니다.

제목 웹폰트는 Google Fonts에서 display=swap으로 로드합니다.
오프라인에서는 명시한 시스템 폰트로 대체되어 기기에 따라 모양이 달라집니다.
이미지 URL은 CSS 파일 기준 상대 경로이며 저장소 하위 경로 배포도 지원합니다.
