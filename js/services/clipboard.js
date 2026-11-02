export async function copyText(text) {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard API를 사용할 수 없습니다.");
  }
  await navigator.clipboard.writeText(text);
}
