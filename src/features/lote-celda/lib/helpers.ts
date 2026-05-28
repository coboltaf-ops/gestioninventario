export function saldoCelda(entrada: number, salida: number) {
  return entrada - salida
}

export function saldosPorCelda() {
  return {}
}

export function generarCodigoAcceso() {
  return 'ACC-' + Math.random().toString(36).substr(2, 9)
}

export function hojaDelDia() {
  return new Date().toISOString().split('T')[0]
}
