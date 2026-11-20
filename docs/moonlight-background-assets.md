# Moonlight 섹션 배경 3종

최신 적용: Hero를 제외한 여섯 섹션은 `section-roses-clean-bottom.png` / `section-rings-clean-bottom.png`를 사용한다. 하단 장미·촛불·랜턴과 관련 정물(잎·천·진주)을 제거하고 상단 장식과 금색 프레임을 유지했다. 원본 이미지는 보관한다. 하단 slice는 145px, 표시 높이는 52–73px로 줄여 불필요한 여백을 제거했다.

편집 도구: built-in imagegen. 각 원본에 적용한 프롬프트: Remove all lower floral and candle still life including leaves, lantern, cloth, pearls and glow; replace with matching deep navy texture; preserve upper ornaments, thin gold frame and bottom corner filigree, same portrait proportions, no crop or added text.

시안에서 텍스트와 UI를 제거하고 재구성한 배경·테두리 일체형 PNG. 현재 Moonlight의 Invitation·Location·Account에는 section-roses.png, Wedding day·Gallery·Guestbook에는 section-rings.png를 적용했다. Hero는 기존 설정을 유지한다.

| 파일 (assets/images/templates/moonlight/) | 디자인 | 권장 용도 |
| --- | --- | --- |
| section-arch.png | 금장 아치·왕관·장미, 황궁과 달 제거 | Hero |
| section-roses.png | 이중 금선·상단 장미와 왕관·하단 촛불과 진주 | Invitation, Gallery |
| section-rings.png | 가는 금선·반지 문장·하단 장미와 랜턴 | Wedding day, Location, Account, Guestbook |

## 적용 기준

- 세로 1:2 비율의 불투명 이미지로 배경과 테두리가 합쳐져 있다. 투명 테두리 레이어가 아니다.
- 중앙에 실제 HTML 콘텐츠를 배치한다. 이미지에 날짜나 이름을 넣지 않는다.
- 원본 비율에서 좌우 12%, 위 20%, 아래 28% 정도를 장식 안전 영역으로 확보한다. 특히 roses의 왼쪽 촛불은 높아 하단 여백이 필요하다.
- `background-size: cover`는 테두리를 자를 수 있다. 비율을 유지하는 컨테이너에서 `100% 100%`로 표시하는 방식이 적합하다.
- 긴 섹션에서는 CSS border-image의 9분할과 fill을 사용한다. 상하 장식의 높이를 너비 기준으로 제한하고 중앙 영역만 늘려, 전체 이미지를 세로로 늘릴 때 생기는 왜곡을 줄인다.
- CSS 금선과 기존 장식 pseudo-element는 중복되지 않게 해제한다. 배경 장식은 접근성 트리에서 제외한다.

## 제작 기록

도구: built-in imagegen. 참고: exec-ba453ac5-2710-4f8a-a7d9-9e9e0468b829.png의 각 패널.

프롬프트 공통: One standalone tall portrait 1:2 reusable wedding website section background, not a triptych. Remove all text, calligraphy, numbers, dates, names, UI and interior divider lines. Empty softly textured deep navy center for real HTML content. Antique gold and burgundy imperial romance fantasy illustration. Entire frame visible, no watermark.

- Arch: Use left panel. Preserve ornate architectural gold arch and columns, ruby crown, corner filigree and burgundy roses. Remove palace, moon, stars and interior scenery. Keep decoration around perimeter.
- Roses: Use middle panel. Preserve double gold border, corner filigree, top burgundy roses, crown ruby pendant and pearl swags. Move candles, roses, jewels, pearls and burgundy embroidered cloth to bottom edge. No shelf across center.
- Rings: Use right panel. Preserve thin gold border, corner filigree, top intertwined wedding rings, crown, ruby pendant and laurel. Keep roses and glowing gold candle lantern at bottom right. Remove calendar and countdown box entirely.
