export function nextDespachoConsecutivo(lastId?: number) {
  return (lastId || 0) + 1
}
