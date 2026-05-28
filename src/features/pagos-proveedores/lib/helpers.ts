export function nextPagoConsecutivo(lastId?: number) {
  return (lastId || 0) + 1
}

export function nextFacturaConsecutivo(lastId?: number) {
  return (lastId || 0) + 1
}

export function nextDepositoConsecutivo(lastId?: number) {
  return (lastId || 0) + 1
}

export function nextAnticipoConsecutivo(lastId?: number) {
  return (lastId || 0) + 1
}
