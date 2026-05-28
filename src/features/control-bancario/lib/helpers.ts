export function nextDepositoConsecutivo(lastId?: number) {
  return (lastId || 0) + 1
}
