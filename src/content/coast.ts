/*
 * Places on the coast map. Tied to the map's geography (positions, icons, distances), so this stays in code
 * rather than in the Edit site editor.
 */

/** Places on the coast map. x/y are positions on a 1000 x 640 sketch, not to scale. */
export const coast = [
  { id: 'pr', name: 'Palm Regal', x: 470, y: 400, detail: 'Your suite, among palms and lawns.', home: true },
  { id: 'beach', name: 'Gopalpur beach', x: 532, y: 462, detail: '5 min walk' },
  { id: 'bam', name: 'Berhampur', x: 330, y: 330, detail: '14 km · about 25 min · nearest railway station' },
  { id: 'tt', name: 'Tara Tarini Temple', x: 520, y: 150, detail: '35 km · hilltop temple with wide views' },
  { id: 'chilika', name: 'Chilika Lake', x: 820, y: 236, detail: "46 km · Asia's largest coastal lagoon" },
  { id: 'sonpur', name: 'Sonpur Blue Flag Beach', x: 236, y: 596, detail: '41 km · a certified clean beach', todo: true },
  { id: 'jirang', name: 'Jirang Monastery', x: 70, y: 210, detail: '113 km · the "Mini Tibet of Odisha"', far: true },
];
