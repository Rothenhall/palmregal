/*
 * Builds the coast map shapes for src/content/coastGeo.json from Natural Earth (public domain).
 * Data: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
 *   ne_10m_land, ne_10m_coastline, ne_10m_roads, ne_10m_admin_1_states_provinces_lines
 * Put them (or the area cut-outs) in data/geo/ and run: node scripts/build-coast.mjs
 */
import fs from 'fs';
import { geoMercator, geoPath } from 'd3-geo';

const W = 1200, H = 760;
const read = f => JSON.parse(fs.readFileSync(`data/geo/${f}`, 'utf8'));
const land = read('ne_10m_land.geojson'), coast = read('sub_ne_10m_coastline.geojson');
const roads = read('sub_ne_10m_roads.geojson'), border = read('sub_ne_10m_admin_1_states_provinces_lines.geojson');

/* the area shown: from Jirang in the west to the mouth of Chilika in the east */
const area = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[84.12, 18.95], [84.12, 19.93], [85.58, 19.93], [85.58, 18.95], [84.12, 18.95]]] /* clockwise, as d3-geo expects */ } };
const proj = geoMercator().fitExtent([[0, 0], [W, H]], area).clipExtent([[-20, -20], [W + 20, H + 20]]);
const path = geoPath(proj).digits(1);

/* places: verified coordinates where published (Wikipedia / ASI), town centres otherwise */
const places = {
  pr: [84.905, 19.258],        // Palm Regal, Gopalpur on Sea (town centre)
  beach: [84.917, 19.249],     // Gopalpur main beach
  bam: [84.794, 19.315],       // Berhampur (Brahmapur)
  tt: [84.8998, 19.4897],      // Tara Tarini Temple (Wikipedia, ASI)
  chilika: [85.105, 19.525],   // Chilika Lake, southern shore near Rambha
  sonpur: [84.776, 19.104],    // Sonapur Blue Flag beach, Bahuda river mouth (approximate)
  jirang: [84.2633, 19.2733],  // Jirang (Padmasambhava Mahavihara) monastery (Wikipedia)
};
const pts = Object.fromEntries(Object.entries(places).map(([k, c]) => [k, proj(c).map(v => +v.toFixed(1))]));
const lbl = c => proj(c).map(v => +v.toFixed(1));

const out = {
  W, H,
  land: path(land),
  coast: path(coast),
  roads: roads.features.map(f => path(f)).join(''),
  border: path(border),
  points: pts,
  labels: { bay: lbl([85.25, 19.12]), odisha: lbl([84.55, 19.62]), andhra: lbl([84.3, 19.0]), chilika: lbl([85.33, 19.69]), nh: lbl([84.72, 19.2]) },
  /* open sea only, south-east of a line along the shore, so depth lines stay out of Chilika */
  openSea: 'M' + [[84.5, 18.86], [85.66, 19.72], [85.9, 18.6], [84.3, 18.6]].map(c => proj(c).map(v => v.toFixed(1)).join(' ')).join('L') + 'Z',
};
fs.writeFileSync('src/content/coastGeo.json', JSON.stringify(out));
console.log('written', Object.fromEntries(Object.entries(out).map(([k, v]) => [k, typeof v === 'string' ? v.length : v])));
