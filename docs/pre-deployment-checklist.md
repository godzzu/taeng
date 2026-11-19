# GitHub Pages 배포 체크리스트

갱신일: 2026-11-17 · 대상 URL: https://godzzu.github.io/taeng/

현재 소스와 배포 구성을 기준으로 작성했습니다. 체크되지 않은 항목은 배포 담당자가 확인해야 합니다. 이번 문서 갱신은 실제 배포·외부 서비스·실기기 검증 완료를 의미하지 않습니다.

## 검증 범위

| 구분 | 상태 |
| --- | --- |
| 설정·빌드 | 소스 확인: .env → 공개 설정 생성, npm run build → dist |
| 배포 workflow | 소스 확인: Node 22, workflow_dispatch 수동 실행, dist 업로드 |
| 화면 구성 | 소스 확인: 본문 7개 섹션, 연락처 모달, 5개 테마 |
| 최근 자동 검증 | 이전 작업에서 날짜·카운트다운·설정 테스트와 빌드 통과. 이번 문서 갱신에서 전체 기능 테스트를 재실행하지 않음 |
| 원격 서비스·실기기 | 이번 갱신에서 미확인. 아래 항목으로 재검증 필요 |

[2026-11-05 점검 기록](pre-deployment-checklist-2026-11-05.md)은 별도로 보관했습니다. 당시 Floral/Sketch 캡처와 통과 결과를 현재 5개 테마의 검증 결과로 간주하지 않습니다.

## 1. 콘텐츠와 공개 범위

- [ ] 최종 templateId, 신랑·신부 이름, 부모님·관계·고인 표시 확인.
- [ ] 예식 일시·홀/층·주소·지도 좌표 일치 확인.
- [ ] 초대 문구, 계좌, 전화번호, 교통·주차 안내의 샘플 값 교체.
- [ ] 대표 사진·소개 카드·갤러리와 대체 텍스트 확인.
- [ ] 연락처 공개 옵션 확인. 비공개 개인정보는 설정 값에서도 제거.
- [ ] share.url, 공유 제목·설명·HTTPS 썸네일 확인.
- [ ] 사용 권한이 있는 등록 음원의 music.key와 재생 경로 확인.
- [ ] 공개 저장소를 사용한다면 문서·사진·설정의 저장소 공개 범위도 확인.

## 2. 환경변수·빌드

- [ ] Node.js 20.10 이상 사용. CI는 현재 workflow의 Node 22 사용.
- [ ] .env.example 기준으로 로컬 .env 구성. 실제 값은 커밋하지 않음.
- [ ] .env와 config/public-env.js가 Git 추적 대상이 아닌지 확인.
- [ ] 공개 설정에 service_role, sb_secret_, 관리자 비밀번호 등 서버 비밀정보가 없는지 확인.
- [ ] npm test 통과. 로컬 HTTP 연결 차단과 코드 실패를 구분해 기록.
- [ ] npm run build 통과. dist는 재생성되므로 별도 수작업 파일을 넣지 않음.
- [ ] dist에 index.html, admin.html, config/public-env.js, CSS/JS/이미지, .nojekyll 포함 확인.
- [ ] dist에 .env, supabase/, scripts/, tests/, docs/가 없는지 확인.
- [ ] dist/index.html의 OG 제목·설명·이미지·URL 확인. build:meta만으로 전체 빌드를 대체하지 않음.
- [ ] 미사용 코드·이미지는 [정리 검토서](deployment-cleanup-review.md)로 검토. 관리자·연락처 모달·OG 의존성을 임의 삭제하지 않음.

## 3. 기능

- [ ] hero, invitation, wedding-info, gallery, location, account, guestbook 출력과 표시 옵션 확인.
- [ ] 소개 사진 전환, 신부 카드 오른쪽 정렬, 고인 아이콘 확인.
- [ ] 달력 예식일 강조, 하단 박스, 두 줄 안내, 일 : 시간 : 분 : 초 카운트다운 확인.
- [ ] 한국 시간 기준 날짜 변경·예식 시작·지난 예식 안내, 백그라운드 복귀 시 시간 갱신 확인.
- [ ] 갤러리 열기·이전/다음·번호·ESC·배경 클릭·스와이프·닫기 후 스크롤/포커스 복원 확인.
- [ ] 이미지 지연 로딩과 로딩 실패 대체 UI 확인.
- [ ] 실제 지도 타일·목적지·카카오맵/네이버지도 링크·주소 복사 확인.
- [ ] 계좌 아코디언·복사 토스트·실패 시 대체 처리 확인.
- [ ] 연락처 모달·부모 연락처 공개 옵션·전화/문자 앱 연결 확인.
- [ ] 음악 버튼 위치·재생/정지·미설정/재생 실패 처리 확인.
- [ ] 제거한 헤더 메뉴·하단 감사 영역·공유 버튼·별도 contact 섹션이 다시 표시되지 않는지 확인.

## 4. Supabase와 관리자

- [ ] supabase/private-info.sql 설치 후 연락처·계좌를 Table Editor에 입력. wedding_id/id와 is_public 확인.
- [ ] supabase/private-info-test.sql 실행 및 직접 테이블 접근 차단·공개 RPC 검증.
- [ ] 계좌/연락처 메뉴 열기 전 요청 없음, 로딩·실패·재시도·빈 목록·복사 확인.
- [ ] .private-info.local.json이 Git과 dist에 포함되지 않는지 확인.

- [ ] 방명록·관리자·음악 SQL 및 RLS/RPC 권한을 운영 프로젝트에서 확인.
- [ ] 방명록 ID와 관리자 비밀번호를 서버에서 설정. 프런트엔드에 비밀번호 저장 금지.
- [ ] 테스트 글 작성 → 승인 대기 → 관리자 공개 → 청첩장 조회 확인.
- [ ] 비공개 전환·삭제·CSV 저장·로그아웃·세션 만료 확인.
- [ ] 미로그인 관리 작업 거부, 비공개 글의 공개 조회 차단 확인.
- [ ] 중복·연속 등록·입력 길이 제한·API 실패 안내 확인.
- [ ] 음악 카탈로그 활성화 상태, Storage 공개 URL, 실제 재생 확인.

데이터 변경 검증은 테스트용 글/환경에서 수행합니다. 클라이언트 식별자 기반 제한을 완전한 스팸 방지로 간주하지 않습니다. CAPTCHA를 사용할 경우 서버 검증을 포함해 별도로 확인합니다.

## 5. 반응형·접근성

현재 버전의 화면은 미확인 상태입니다. 검증 후 각 칸을 결과로 교체합니다.

| 너비 | Floral | Sketch | Ticket | Marble | Autumn |
| --- | --- | --- | --- | --- | --- |
| 320px | 미확인 | 미확인 | 미확인 | 미확인 | 미확인 |
| 375px | 미확인 | 미확인 | 미확인 | 미확인 | 미확인 |
| 430px | 미확인 | 미확인 | 미확인 | 미확인 | 미확인 |
| 768px | 미확인 | 미확인 | 미확인 | 미확인 | 미확인 |
| 1440px | 미확인 | 미확인 | 미확인 | 미확인 | 미확인 |

- [ ] 최대 448px·좁은 화면 100% 너비, 가로 스크롤·테두리/달력 겹침 없음 확인.
- [ ] 긴 이름·문구·계좌번호·큰 카운트다운 일수에서도 잘림 없음 확인.
- [ ] 음악 버튼이 콘텐츠 최대 너비를 벗어나지 않는지 확인.
- [ ] 모달 화면 내 표시, 키보드 포커스 이동·닫기·복원 확인.
- [ ] 모션 감소 설정, fade-up, 소개 사진 전환, 테마별 hero 효과 확인.
- [ ] VoiceOver/TalkBack으로 제목·폼 오류·모달·토스트 확인. 카운트다운이 매초 반복 낭독되지 않는지 확인.
- [ ] 실제 iOS/Android에서 회전·스와이프·복사·전화·문자·음악 확인.

## 6. GitHub Pages 배포 후 확인

- [ ] Actions secrets에 PUBLIC_KAKAO_JAVASCRIPT_KEY, PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY(전용 키 사용 시), PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY 등록.
- [ ] 기본값과 다르면 Actions variables에 PUBLIC_GUESTBOOK_PROVIDER, PUBLIC_GUESTBOOK_WEDDING_ID 등록.
- [ ] Pages Source를 GitHub Actions로 설정. 로컬 .env가 자동 전달되지 않음을 확인.
- [ ] 코드 push 후 Deploy wedding invitation → Run workflow 실행. push 자동 배포가 아님.
- [ ] workflow 성공 및 실제 배포 URL 확인.
- [ ] /wd_letter/와 /wd_letter/admin.html 접속, 하위 경로 리소스 404 확인.
- [ ] Kakao 도메인/API 설정에 실제 원점 https://godzzu.github.io 반영 및 지도 표시 확인.
- [ ] 청첩장·공유 이미지의 인증 없는 HTTPS 접근과 링크 미리보기 확인. 공유 버튼 실행은 현재 UI 검증 대상이 아님.
- [ ] 배포 페이지에서 Supabase 조회·관리자·음악·모바일 동작 최종 확인.

배포 기록: 커밋 ______ / workflow 실행 ______ / 배포 시각 ______ / 검증자 ______ / 남은 문제 ______
