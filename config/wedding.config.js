// 콘텐츠 전용 설정. visible: false로 섹션 또는 개별 항목을 숨깁니다.
// 날짜/시간은 한국 시간이며, 표시 문구는 자동 생성됩니다.
export const weddingConfig = {
  templateId: "wedding-floral",
  basic: { groomName: "홍길동", brideName: "김하나", weddingDate: "2027-05-15", weddingTime: "12:30" },
  hero: {
    visible: true, title: "소중한 분들을 초대합니다", subtitle: "WE ARE GETTING MARRIED",
    image: { visible: true, src: "./assets/images/gallery/photo-01.svg", alt: "신랑 신부의 웨딩 사진" },
    linkLabel: "초대장 열기"
  },
  invitation: {
    visible: true, title: "초대합니다", subtitle: "INVITATION",
    message: "서로의 이름을 부르며 살아온 두 사람이\n이제 하나의 이름으로 새로운 시작을 합니다.\n따뜻한 마음으로 축복해 주세요.",
    parents: [
      { visible: true, label: "신랑 측", father: "홍OO", mother: "김OO", relation: "장남" },
      { visible: true, label: "신부 측", father: "김OO", mother: "박OO", relation: "장녀" }
    ]
  },
  // 장소 정보는 이곳에서 한 번만 입력합니다. 오시는 길에서도 공유합니다.
  weddingInfo: {
    visible: true, title: "소중한 약속의 날", subtitle: "WEDDING DAY",
    venue: "OO 웨딩홀", hall: "2층 그랜드홀", address: "서울특별시 OO구 OO로 00",
    showDday: true
  },
  gallery: {
    visible: true, title: "우리의 순간", subtitle: "GALLERY",
    items: [
      { visible: true, src: "./assets/images/gallery/photo-01.svg", alt: "웨딩 사진 샘플 1" },
      { visible: true, src: "./assets/images/gallery/photo-02.svg", alt: "웨딩 사진 샘플 2" },
      { visible: true, src: "./assets/images/gallery/photo-03.svg", alt: "웨딩 사진 샘플 3" }
    ]
  },
  location: {
    visible: true, title: "오시는 길", subtitle: "LOCATION",
    transport: { visible: true, text: "대중교통: OO역에서 도보 5분" },
    parking: { visible: true, text: "주차: 건물 내 주차장 이용 가능" },
    // 실제 예식장 좌표를 입력하세요. 미설정은 null입니다.
    coordinates: { latitude: null, longitude: null },
    links: [
      { visible: true, label: "카카오맵에서 보기", url: "https://map.kakao.com/" },
      { visible: true, label: "네이버 지도에서 보기", url: "https://map.naver.com/" }
    ]
  },
  account: {
    visible: true, title: "마음 전하실 곳", subtitle: "ACCOUNT",
    description: "축하의 마음을 전하실 분들을 위해 계좌 정보를 안내합니다.",
    items: [
      { visible: true, label: "신랑 측", bank: "OO은행", holder: "홍길동", number: "000-000-000000" },
      { visible: true, label: "신부 측", bank: "OO은행", holder: "김하나", number: "000-000-000000" }
    ]
  },
  contact: {
    visible: true, title: "연락하기", subtitle: "CONTACT",
    items: [
      { visible: true, label: "신랑", name: "", person: "groom", phone: "010-0000-0000" },
      { visible: true, label: "신부", name: "", person: "bride", phone: "010-0000-0000" }
    ]
  },
  guestbook: {
    visible: false, title: "축하의 마음을 남겨주세요", subtitle: "GUESTBOOK",
    description: "따뜻한 축하 메시지를 남겨주세요."
  },
  footer: { visible: true, message: "축복해 주셔서 감사합니다." },
  share: {
    visible: true,
    // 빈 문자열이면 이름과 날짜로 자동 생성합니다. 직접 입력하면 해당 문구를 사용합니다.
    title: "", description: "", url: "",
    image: { visible: true, src: "./assets/images/gallery/photo-01.svg", alt: "결혼식 초대장" }
  },
  labels: {
    brand: "Wedding Invitation", weddingNav: "예식 정보", galleryNav: "갤러리", locationNav: "오시는 길",
    copyAccount: "계좌번호 복사", accountCopied: "계좌번호가 복사되었습니다.",
    copyFailed: "복사에 실패했습니다. 브라우저 권한을 확인해 주세요.",
    call: "전화하기", sms: "문자하기", share: "청첩장 주소 복사",
    shareCopied: "주소가 복사되었습니다", shareFailed: "주소 복사에 실패했습니다",
    guestName: "이름", guestNamePlaceholder: "이름을 입력해 주세요",
    guestMessage: "축하 메시지", guestMessagePlaceholder: "따뜻한 축하 메시지를 남겨주세요",
    guestSubmit: "메시지 남기기", guestUnavailable: "방명록 서비스 연결이 필요합니다.",
    ddayToday: "오늘, 결혼합니다", ddayPast: "결혼식이 {days}일 지났습니다",
    galleryOpen: "{number}번 사진 크게 보기", galleryDialog: "갤러리 이미지 확대",
    galleryClose: "이미지 닫기", galleryPrev: "이전 이미지", galleryNext: "다음 이미지",
    home: "처음으로", navigation: "페이지 내 메뉴"
  }
};
