# 설정 파일로 배경음악 선택하기

음원은 Supabase에 미리 등록하고 청첩장의 `music.key`로 선택합니다. 방명록 관리자 페이지에는 업로드·교체·삭제 기능이 없습니다. 음악 전용 Edge Function도 필요하지 않습니다.

## 1. Supabase 설정

Supabase SQL Editor에서 `supabase/music.sql`을 실행합니다. 이 파일은 `music_tracks` 테이블, 조회용 `get_wedding_track` 함수, `wedding-music` Storage 버킷을 준비합니다. 기존 파일과 구형 `guestbook_music` 데이터는 삭제하지 않습니다.

기존 버킷이 있다면 설정을 유지하므로 `wedding-music` 버킷이 Public인지 확인합니다. 공개 URL로 곡을 재생합니다. 음원 관리 작업은 Supabase 프로젝트 소유자가 수행하고, 청첩장·방명록 관리자는 파일을 직접 등록하거나 수정할 수 없습니다.

## 2. 등록된 음원과 key 연결

Supabase Storage의 `wedding-music` 버킷에 있는 실제 파일 경로를 확인하고, Table Editor의 `music_tracks`에 다음과 같이 등록합니다.

| 필드 | 예시 | 의미 |
| --- | --- | --- |
| key | piano-01 | config에서 선택할 고유 키. 영문·숫자·하이픈·밑줄, 최대 80자 |
| name | 잔잔한 피아노 | 표시용 곡 이름 |
| path | catalog/piano-01.mp3 | 버킷 내부의 실제 파일 경로 |
| enabled | true | 조회·선택 허용 여부 |

`path`에는 전체 URL이나 버킷명, 맨 앞 슬래시를 넣지 않습니다. 하위 폴더와 한글 파일명도 사용할 수 있습니다. MP3·M4A·OGG를 지원하며 모바일에서는 MP3가 호환성이 좋습니다.

예시 SQL(해당 파일이 실제 존재하는 경우):

```sql
insert into public.music_tracks(key, name, path, enabled)
values ('piano-01', '잔잔한 피아노', 'catalog/piano-01.mp3', true)
on conflict(key) do update
set name = excluded.name, path = excluded.path, enabled = excluded.enabled;
```

예시 음원이나 파일은 자동 생성하지 않습니다. 기존 등록 음원의 UUID 파일명도 path에 그대로 연결할 수 있습니다.

## 3. 청첩장에서 곡 선택

`config/wedding.config.js`에서 수정합니다.

```js
music: {
  visible: true,
  key: "piano-01"
},
```

`key`는 `music_tracks.key`와 정확히 일치해야 합니다. 이 키는 비밀번호나 Supabase API 키가 아닙니다. 현재 기본값은 빈 문자열이며 실제 곡을 임의로 선택하지 않습니다.

- 빈 key 또는 `visible: false`: 조회하지 않고 재생 버튼을 숨깁니다.
- 없는 key 또는 `enabled: false`: 재생 버튼을 숨깁니다.
- 유효한 key: 해당 곡의 재생·정지 버튼을 표시합니다.
- config 수정 후 GitHub에 Push하고 재배포된 청첩장을 새로고침합니다.
- 같은 key의 path를 Supabase에서 변경하면 재배포 없이 다음 청첩장 로딩부터 새 경로를 사용합니다.

재생은 방문자의 버튼 클릭으로 시작합니다. 자동 재생하지 않으며, 정지는 재생 위치를 처음으로 돌립니다. 반복 재생과 백그라운드 전환 시 정지는 유지됩니다.

## 이전 업로드 방식에서 전환

1. 새 `supabase/music.sql`을 실행합니다. 이전 업로드 함수가 사용하는 인증·저장 RPC를 제거하므로 기존 Edge Function의 업로드도 더 이상 허용되지 않습니다.
2. Supabase → Edge Functions에서 이전 `wedding-music` 함수를 삭제합니다. 로컬 소스 제거만으로 이미 배포된 함수가 삭제되지는 않습니다.
3. 사용할 기존 음원을 music_tracks에 연결하고 config에 key를 지정합니다.
4. 변경된 프런트엔드를 재배포합니다.

기존 Storage 음원과 구형 테이블 데이터는 보존됩니다. enabled를 false로 바꾸는 것은 청첩장에서의 곡 선택을 막는 것이며, 이미 알려진 공개 파일 URL을 비공개로 바꾸는 것은 아닙니다.

## 검증

`node tests/music.test.mjs`에서 key 기반 조회, 빈 key, 없는 곡, 경로 검증, 자동 재생 없음, 재생·정지·오류 처리를 검증합니다. `supabase/music-test.sql`은 실제 DB의 활성화 여부·조회 권한·구형 업로드 RPC 제거를 확인하고 테스트 데이터를 롤백합니다.

Supabase의 실제 SQL 실행, 음원 목록 등록, 기존 Edge Function 삭제는 이번 로컬 수정에서 수행하지 않았습니다.
