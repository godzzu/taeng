// 공개되어도 되는 브라우저용 설정만 저장합니다.
// 비밀키, 관리자 비밀번호, 서비스 role key를 넣지 마세요.
export const appConfig = {
  kakaoJavascriptKey: "fe7e98d6a9a929b11d49ba514b008f3a",
  kakaoMapJavascriptKey: "fe7e98d6a9a929b11d49ba514b008f3a", // 카카오 지도용 JavaScript 키. 비어 있으면 위 키를 사용합니다.
  guestbookProvider: "supabase", // "none" 또는 "supabase"
  supabaseUrl: "https://tmkxiydwxtjhjmenbmxe.supabase.co",
  supabasePublishableKey: "sb_publishable_PmhRJiykqmY0IqwHgncWvg_snP_Vmu9", // 공개 publishable 키 또는 legacy anon 키만 입력
  guestbookWeddingId: "default"
};
