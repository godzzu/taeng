// 콘텐츠 전용 설정. visible: false로 섹션 또는 개별 항목을 숨깁니다.
// 날짜/시간은 한국 시간이며, 표시 문구는 자동 생성됩니다.
export const weddingConfig = {
  music: { visible: true, key: "atlasaudio" }, // Supabase music_tracks에 등록된 key. 비워 두면 음악을 사용하지 않습니다.
  templateId: "wedding-sketch",
  basic: { groomName: "홍길동", brideName: "김하나", weddingDate: "2027-05-15", weddingTime: "12:30" },
  hero: {
    visible: true, title: "", subtitle: "WE ARE GETTING MARRIED",
    image: { visible: true, src: "./assets/images/gallery/photo-01.svg", alt: "신랑 신부의 웨딩 사진" },
    linkLabel: "초대장 열기"
  },
  invitation: {
    visible: true, title: "", subtitle: "INVITATION",
    message: "서로의 이름을 부르며 살아온 두 사람이\n이제 하나의 이름으로 새로운 시작을 합니다.\n따뜻한 마음으로 축복해 주세요.",
    parents: [
      // 고인인 부모님만 fatherDeceased 또는 motherDeceased를 true로 설정합니다.
      { visible: true, person: "groom", label: "신랑 측", father: "홍OO", fatherDeceased: true, mother: "김OO", motherDeceased: false, relation: "장남" },
      { visible: true, person: "bride", label: "신부 측", father: "김OO", fatherDeceased: false, mother: "박OO", motherDeceased: false, relation: "장녀" }
    ]
  },
  // 장소 정보는 이곳에서 한 번만 입력합니다. 오시는 길에서도 공유합니다.
  weddingInfo: {
    visible: true, title: "", subtitle: "WEDDING DAY",
    venue: "보타닉파크웨딩", hall: "2층 그랜드홀", address: "서울특별시 강서구 마곡중앙5로 6 보타닉푸르지오시티 L층",
    showDday: true
  },
  gallery: {
    visible: true, title: "", subtitle: "GALLERY",
    items: [
      { visible: true, src: "./assets/images/gallery/photo-01.svg", alt: "웨딩 사진 샘플 1" },
      { visible: true, src: "./assets/images/gallery/photo-02.svg", alt: "웨딩 사진 샘플 2" },
      { visible: true, src: "./assets/images/gallery/photo-03.svg", alt: "웨딩 사진 샘플 3" },
      { visible: true, src: "./assets/images/gallery/photo-04.svg", alt: "웨딩 샘플 4: 아치 안의 결혼반지" },
      { visible: true, src: "./assets/images/gallery/photo-05.svg", alt: "웨딩 샘플 5: 리본으로 묶은 꽃다발" },
      { visible: true, src: "./assets/images/gallery/photo-06.svg", alt: "웨딩 샘플 6: 하트가 담긴 편지" }
    ]
  },
  location: {
    visible: true, title: "오시는 길", subtitle: "LOCATION",
    // 자차 text를 비우면 예식장 이름과 주소로 자동 안내합니다.
    car: { visible: true, title: "자차", text: "" },
    transport: { visible: true, title: "대중교통 · 버스", text: "위 지도 앱에서 출발지를 입력한 뒤 대중교통 경로를 확인해 주세요." },
    subway: { visible: true, title: "지하철", text: "위 지도 앱에서 지하철 경로와 도착역 출구를 확인해 주세요." },
    parking: { visible: true, title: "주차", text: "건물 내 주차장 이용 가능\n주차 등록 및 이용 시간은 예식장에 확인해 주세요." },
    // 실제 예식장 좌표를 입력하세요. 미설정은 null입니다.
    coordinates: { latitude: 37.5671332722828, longitude: 126.826736284866 },
    links: [
      { visible: true, provider: "kakao", label: "카카오맵 길찾기", url: "https://map.kakao.com/link/map/1089036510" },
      // 네이버 지도에서 목적지를 지정한 후 복사한 공유 URL을 넣으세요.
      { visible: true, provider: "naver", label: "네이버 지도 길찾기", url: "https://map.naver.com/v5/search/보타닉파크웨딩" }
    ]
  },
  account: {
    visible: true, title: "마음 전하실 곳", subtitle: "ACCOUNT",
    description: "축하의 마음을 전하실 분들을 위해 계좌 정보를 안내합니다.",
    groupTitles: { groom: "신랑측 마음 전하는 곳", bride: "신부측 마음 전하는 곳", other: "마음 전하는 곳" },
    items: [
      { visible: true, side: "groom", label: "신랑", bank: "OO은행", holder: "홍길동", number: "000-000-000000" },
      { visible: true, side: "bride", label: "신부", bank: "OO은행", holder: "김하나", number: "000-000-000000" }
    ]
  },
  contact: {
    visible: true, title: "연락하기", subtitle: "CONTACT",
    items: [
      { visible: true, label: "신랑", name: "", person: "groom", phone: "010-4966-1988" },
      { visible: true, label: "신부", name: "", person: "bride", phone: "010-4966-1988" },
      // 부모님 연락처는 실제 정보를 입력하고 visible을 true로 변경하세요.
      { visible: false, label: "신랑 아버지", name: "", phone: "" },
      { visible: false, label: "신랑 어머니", name: "", phone: "" },
      { visible: false, label: "신부 아버지", name: "", phone: "" },
      { visible: false, label: "신부 어머니", name: "", phone: "" }
    ]
  },
  guestbook: {
    visible: true, title: "축하의 마음을 남겨주세요", subtitle: "GUESTBOOK",
    description: "따뜻한 축하 메시지를 남겨주세요."
  },
  footer: { visible: true, message: "축복해 주셔서 감사합니다." },
  share: {
    visible: true,
    // 빈 문자열이면 이름과 날짜로 자동 생성합니다. 직접 입력하면 해당 문구를 사용합니다.
    title: "", description: "", url: "https://godzzu.github.io/wd_letter/",
    image: { visible: true, src: "./assets/images/og/wedding.png", alt: "결혼식 초대장" }
  },
  labels: {
    brand: "Wedding Invitation", weddingNav: "예식 정보", galleryNav: "갤러리", locationNav: "오시는 길",
    copyAccount: "계좌번호 복사", accountCopied: "계좌번호가 복사되었습니다.",
    copyFailed: "복사에 실패했습니다. 브라우저 권한을 확인해 주세요.",
    accountCopyFallback: "자동 복사가 되지 않았습니다. 선택된 계좌번호를 길게 누르거나 Ctrl+C로 복사해 주세요.",
    accountNumber: "계좌번호", accountHolder: "예금주",
    call: "전화하기", sms: "문자하기", share: "카카오톡으로 공유하기",
    shareLoading: "공유 기능을 준비하고 있습니다.", shareReady: "버튼을 눌러 카카오톡으로 공유해 주세요.",
    shareNoKey: "공유 기능을 준비 중입니다. 잠시 후 다시 이용해 주세요.",
    shareInvalidUrl: "공유 주소가 아직 준비되지 않았습니다.",
    shareInvalidImage: "공유 이미지를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.",
    shareSdkError: "카카오톡 공유를 준비하지 못했습니다. 버튼을 눌러 다시 시도해 주세요.",
    shareSendError: "공유창을 열지 못했습니다. 팝업 차단을 확인한 후 다시 시도해 주세요.",
    shareOpened: "공유창에서 받는 사람을 선택해 주세요. 창이 보이지 않으면 팝업 차단을 확인해 주세요.",
    shareCopied: "주소가 복사되었습니다", shareFailed: "주소 복사에 실패했습니다",
    guestName: "이름", guestNamePlaceholder: "이름을 입력해 주세요",
    guestMessage: "축하 메시지", guestMessagePlaceholder: "따뜻한 축하 메시지를 남겨주세요",
    guestSubmit: "메시지 남기기", guestUnavailable: "방명록 서비스 연결이 필요합니다.",
    guestLoading: "축하 메시지를 불러오는 중입니다.", guestSaving: "메시지를 등록하는 중입니다.",
    guestSaved: "축하 메시지가 등록되었습니다.", guestPending: "감사합니다. 메시지는 확인 후 공개됩니다.",
    guestEmpty: "첫 축하 메시지를 남겨주세요.", guestMore: "메시지 더 보기", guestRetry: "다시 불러오기",
    guestError: "연결하지 못했습니다. 잠시 후 다시 시도해 주세요. 입력한 내용은 유지됩니다.",
    guestLoadError: "메시지를 불러오지 못했습니다. 다시 불러오기를 눌러 주세요.",
    guestNameInvalid: "이름을 1~30자로 입력해 주세요.", guestMessageInvalid: "축하 메시지를 1~300자로 입력해 주세요.",
    guestRateLimit: "등록이 많습니다. 잠시 후 다시 시도해 주세요.",
    guestDuplicate: "같은 내용이 이미 접수되었습니다.", guestClosed: "현재 메시지 등록이 마감되었습니다.",
    ddayToday: "오늘, 결혼합니다", ddayPast: "결혼식이 {days}일 지났습니다",
    galleryOpen: "{number}번 사진 크게 보기", galleryDialog: "갤러리 이미지 확대",
    galleryClose: "이미지 닫기", galleryPrev: "이전 이미지", galleryNext: "다음 이미지",
    galleryLoading: "사진을 불러오는 중입니다.", galleryError: "사진을 불러올 수 없습니다.",
    galleryRetry: "다시 시도", galleryThumbnailError: "사진 로딩 실패",
    copyAddress: "주소 복사", addressCopied: "주소가 복사되었습니다.",
    addressCopyFailed: "주소를 복사하지 못했습니다. 위 주소를 길게 눌러 복사해 주세요.",
    mapLoading: "지도를 불러오는 중입니다.",
    mapUnavailable: "지도를 표시할 수 없습니다. 아래 지도 버튼으로 위치를 확인해 주세요.",
    mapNoCoordinates: "위치 안내를 준비 중입니다. 주소와 아래 지도 버튼을 확인해 주세요.",
    mapLabel: "{venue} 위치 지도", mapNewWindow: "새 창에서 열기",
    kakaoSearch: "카카오맵에서 장소 찾기", naverSearch: "네이버 지도에서 장소 찾기",
    home: "처음으로", navigation: "페이지 내 메뉴"
  }
};
