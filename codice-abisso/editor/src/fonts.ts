import {continueRender, delayRender, staticFile} from 'remotion';
const faces: [string, string, string][] = [
  ['Montserrat', 'fonts/montserrat-latin-300-normal.woff2', '300'],
  ['Montserrat', 'fonts/montserrat-latin-500-normal.woff2', '500'],
  ['Montserrat', 'fonts/montserrat-latin-800-normal.woff2', '800'],
  ['Anton', 'fonts/anton-latin-400-normal.woff2', '400'],
];
const h = delayRender('fonts');
Promise.all(
  faces.map(([fam, url, weight]) => {
    const f = new FontFace(fam, `url(${staticFile(url)}) format('woff2')`, {weight});
    return f.load().then((ff) => { (document as any).fonts.add(ff); });
  }),
).then(() => continueRender(h)).catch(() => continueRender(h));
