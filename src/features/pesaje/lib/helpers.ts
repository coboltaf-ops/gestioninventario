export function calcularPesoNeto(bruto: number, tara: number) {
  return bruto - tara
}

export function nextPesajeConsecutivo(lastId?: number) {
  return (lastId || 0) + 1
}

export function hojaDelDia() {
  return new Date().toISOString().split('T')[0]
}
