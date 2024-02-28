const meses = {
  Enero: '01',
  Febrero: '02',
  Marzo: '03',
  Abril: '04',
  Mayo: '05',
  Junio: '06',
  Julio: '07',
  Agosto: '08',
  Septiembre: '09',
  Octubre: '10',
  Noviembre: '11',
  Diciembre: '12',
};

export function formatearFecha(fecha: string) {
  const newfecha = fecha.split(' ');
  return [newfecha[4], meses[newfecha[2]], newfecha[0]];
}
