# 연락처·계좌정보를 Supabase에서 관리하기

현재 단계는 저장소와 정적 JavaScript에서 전화번호·은행·예금주·계좌번호를 분리하는 단계입니다. 초대 비밀번호는 없습니다. `is_public = true`인 항목은 공개 RPC로 누구나 조회할 수 있으며, ID는 비밀번호가 아닙니다. 화면 표시나 응답을 받은 사람이 복사하는 것은 막지 않습니다.

## 1. 배포 전에 테이블과 RPC 설치

Supabase 프로젝트의 SQL Editor에서 [private-info.sql](../supabase/private-info.sql) 전체를 실행합니다. 기존 방명록/음악 테이블은 변경하지 않습니다.

- `wedding_contacts`: 연락처
- `wedding_accounts`: 계좌
- `list_public_wedding_contacts`: 공개 연락처만 조회
- `list_public_wedding_accounts`: 공개 계좌만 조회

테이블은 RLS를 활성화하고 anon/authenticated의 직접 읽기·쓰기 권한을 제거합니다. 조회 함수는 고정된 search_path에서 지정한 청첩장·ID·공개 항목만 반환하며 해당 함수 실행만 허용합니다. 반환 항목이 없으면 빈 배열입니다.

## 2. Table Editor에서 실제 값 입력

SQL로 입력하려면 [INSERT/갱신 템플릿](../supabase/private-info-insert.sql)을 SQL Editor에 복사해 사용하세요. `<...>`를 실제 값으로 바꾸고 불필요한 행은 삭제합니다. 기본값은 모두 비공개이며 공개할 행만 `is_public = true`로 변경합니다. 같은 ID가 이미 있으면 입력한 값으로 갱신되므로 재실행 시 확인하세요. 수정한 개인정보 포함 쿼리는 저장소에 저장하지 않습니다.

실제 개인정보를 SQL 파일이나 Git에 다시 넣지 마세요. Supabase 관리 화면에서 입력합니다. 이전 값은 로컬 `.private-info.local.json`에만 보관했습니다. 이 파일은 Git과 dist에서 제외하며 입력 참고용입니다. 기존 예시 계좌는 실제 값으로 교체해야 합니다. 입력을 마치면 로컬 보관 파일도 필요에 따라 삭제하세요.

공통 필드:

| 필드 | 값 |
| --- | --- |
| wedding_id | Actions/.env의 PUBLIC_GUESTBOOK_WEDDING_ID와 동일. 기본 default |
| id | 아래 설정의 조회 ID와 동일 |
| is_public | 공개하려는 항목만 true. 기본 false |
| sort_order | 정렬 번호. 현재 UI는 설정 배열의 표시 순서를 우선 사용 |

연락처 필드:

| id 예시 | person | label |
| --- | --- | --- |
| groom | groom | 신랑 |
| bride | bride | 신부 |
| groom-father | groomFather | 신랑 아버지 |
| groom-mother | groomMother | 신랑 어머니 |
| bride-father | brideFather | 신부 아버지 |
| bride-mother | brideMother | 신부 어머니 |

각 행에 `name`, `phone`을 입력합니다. 전화번호는 문자열이며 국제번호의 +와 공백·괄호·하이픈을 지원합니다.

계좌는 `id`를 groom/bride 또는 추가 ID로 지정하고, `side`를 groom/bride/other 중 하나로 선택한 뒤 `label`, `bank`, `holder`, `account_number`를 입력합니다. 계좌번호는 문자열로 저장하므로 앞자리 0이 유지됩니다. 같은 청첩장 안에서 테이블별 id는 고유해야 합니다.

## 3. 청첩장 설정

```js
account: {
  // 기존 제목·설명·groupTitles 유지
  visible: true,
  items: [
    { visible: true, id: "groom", side: "groom" },
    { visible: true, id: "groom-father", side: "groom" },
    { visible: true, id: "bride", side: "bride" }
  ]
},
contact: {
  visible: true,
  title: "축하연락하기",
  items: [
    { visible: true, id: "groom", person: "groom" },
    { visible: true, id: "bride", person: "bride" },
    { visible: false, id: "groom-father", person: "groomFather" }
  ]
}
```

부모 연락처는 클라이언트 visible을 true로 하고 DB에서도 is_public을 true로 해야 표시됩니다. **조회 자체를 막으려면 DB의 is_public을 false로 변경**하세요. 클라이언트 visible만 false로 바꾸는 것은 API 비공개 설정이 아닙니다.

은행·예금주·계좌번호·연락처 이름·전화번호를 account/contact.items에 다시 넣으면 빌드가 실패하도록 했습니다. 본문 신랑·신부·부모님 소개 이름과 예식장 정보는 기존 공개 콘텐츠로 유지합니다.

## 4. 화면과 운영

- 계좌 그룹을 처음 펼칠 때 해당 그룹의 ID만 조회합니다.
- 축하연락하기를 처음 열 때 활성화된 연락처 ID만 조회합니다.
- 로딩·공개 정보 없음·실패·재시도 UI를 제공합니다.
- 성공한 결과는 현재 페이지 메모리에만 보관합니다. localStorage/IndexedDB에는 저장하지 않고 요청은 no-store입니다. DB 수정 후 이미 열린 페이지는 새로고침해야 반영됩니다.
- 재초기화 시 요청을 취소하고 늦게 도착한 응답이 이전 화면에 반영되지 않도록 합니다.
- 표시에는 textContent를 사용하고 tel/sms 번호를 검증합니다.
- 관리 입력·수정은 Supabase에서만 합니다. 기존 방명록 관리자 페이지에 개인정보 편집 기능은 추가하지 않았습니다.

## 5. 검증과 배포

1. SQL 설치 후 Table Editor에서 값과 공개 상태를 설정합니다.
2. SQL Editor에서 [private-info-test.sql](../supabase/private-info-test.sql)을 실행해 공개 필터·청첩장 분리·직접 접근 차단을 검증합니다. 합성 데이터만 사용하고 끝에서 rollback합니다. 오류 시에도 세션의 트랜잭션을 rollback하세요.
3. `npm test`, `npm run build` 실행 후 dist에 실제 전화번호·계좌번호가 없는지 확인합니다.
4. Actions에서 재배포하고 계좌 펼치기·복사·연락처 모달·전화/문자 링크를 확인합니다.

SQL을 설치하기 전에 새 화면을 배포하면 정보 제공 준비 중 안내가 나옵니다. 이번 코드 변경은 원격 DB에 SQL을 실행하거나 기존 개인정보를 자동 업로드하지 않습니다.

Git 과거 커밋과 이미 배포된 이전 파일은 현재 파일 정리만으로 지워지지 않습니다. 이력 재작성은 별도 작업이며 이번 변경에서는 하지 않았습니다.

권한 설계 참고: [Supabase Database functions](https://supabase.com/docs/guides/database/functions).
