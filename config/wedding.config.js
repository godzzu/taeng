// 청첩장에 표시되는 내용은 이 파일에서 수정합니다.
export const weddingConfig = {
  templateId: "wedding-floral", // "wedding-floral" 또는 "wedding-sketch"
  basic: {
    groomName: "홍길동",
    brideName: "김하나",
    weddingDate: "2027-05-15",
    weddingTime: "12:30",
    dateLabel: "2027년 5월 15일 토요일",
    timeLabel: "오후 12시 30분"
  },
  hero: {
    title: "소중한 분들을 초대합니다",
    subtitle: "WE ARE GETTING MARRIED"
  },
  invitation: {
    title: "초대합니다",
    message: "서로의 이름을 부르며 살아온 두 사람이\\n이제 하나의 이름으로 새로운 시작을 합니다.\\n따뜻한 마음으로 축복해 주세요.",
    groomParents: { father: "홍OO", mother: "김OO", relation: "장남" },
    brideParents: { father: "김OO", mother: "박OO", relation: "장녀" }
  },
  weddingInfo: {
    venue: "OO 웨딩홀",
    hall: "2층 그랜드홀",
    address: "서울특별시 OO구 OO로 00"
  },
  gallery: [
    { id: 1, src: "./assets/images/gallery/photo-01.svg", alt: "웨딩 사진 샘플 1" },
    { id: 2, src: "./assets/images/gallery/photo-02.svg", alt: "웨딩 사진 샘플 2" },
    { id: 3, src: "./assets/images/gallery/photo-03.svg", alt: "웨딩 사진 샘플 3" }
  ],
  location: {
    venue: "OO 웨딩홀",
    address: "서울특별시 OO구 OO로 00",
    transport: "대중교통: OO역에서 도보 5분",
    parking: "주차: 건물 내 주차장 이용 가능",
    kakaoMapUrl: "https://map.kakao.com/",
    naverMapUrl: "https://map.naver.com/"
  },
  account: {
    enabled: true,
    groom: [{ bank: "OO은행", holder: "홍길동", number: "000-000-000000" }],
    bride: [{ bank: "OO은행", holder: "김하나", number: "000-000-000000" }]
  },
  contacts: [
    { label: "신랑", name: "홍길동", phone: "010-0000-0000", visible: true },
    { label: "신부", name: "김하나", phone: "010-0000-0000", visible: true }
  ],
  guestbook: { enabled: false },
  share: {
    title: "홍길동 ♥ 김하나 결혼합니다",
    description: "2027년 5월 15일 토요일 오후 12시 30분",
    url: "https://username.github.io/mobile-wedding/"
  }
};
