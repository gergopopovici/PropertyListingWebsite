import express from 'express';
import multer from 'multer';
import path from 'path';
import { check, validationResult } from 'express-validator';
import fs, { existsSync, mkdirSync } from 'fs';

const app = express();
const uploadDir = path.join(process.cwd(), 'uploadDir');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}
const hirdetesek = [];
const uploadedImages = [];
let filterHirdetesek = [];
app.use(express.static(`${process.cwd()}/public`));
app.use('/uploads', express.static(uploadDir));
const mutlerUpload = multer({ dest: uploadDir, limits: { fileSize: 5000000 } });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post(
  '/submitannouncement_form',
  [
    check('varos').isString().isLength({ min: 1 }).withMessage('Város megadása kötelező!'),
    check('kerulet').isString().isLength({ min: 1 }).withMessage('Kerület megadása kötelező!'),
    check('felszinterulet').isInt({ min: 10 }).withMessage('A felszínterület minimum 10m^2 kell legyen.'),
    check('ar').isInt({ min: 1 }).withMessage('Az ár értéke pozitív szám kell legyen.'),
    check('szobak').isInt({ min: 1 }).withMessage('A szobák száma legalább egy kell legyen.'),
    check('datum').isDate().withMessage('A dátum érvényes dátum formátumban kell legyen.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { varos, kerulet, felszinterulet, ar, szobak, datum } = req.body;
    const ujHirdetes = {
      id: hirdetesek.length + 1,
      varos,
      kerulet,
      felszinterulet,
      ar,
      szobak,
      datum,
    };
    hirdetesek.push(ujHirdetes);
    res.json({ id: ujHirdetes.id });
  },
);
app.post('/submitpic_form', mutlerUpload.single('kep'), (req, res) => {
  const { adId } = req.body;
  const hirdetesExists = hirdetesek.some((hirdetes) => Number(hirdetes.id) === Number(adId));
  if (!hirdetesExists) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
    res.status(400).send('Hirdetés nem található!');
    return;
  }
  const image = req.file;
  uploadedImages.push({ adId, image });
  res.json({ image });
});
app.post('/submit_form', (req, res) => {
  const { varos, kerulet, minar, maxar } = req.body;
  filterHirdetesek = hirdetesek.filter(
    (hirdetes) =>
      hirdetes.varos === varos &&
      (kerulet === '' || hirdetes.kerulet === kerulet) &&
      (minar === '' || hirdetes.ar >= minar) &&
      (maxar === '' || hirdetes.ar <= maxar),
  );
  res.json(filterHirdetesek);
});
app.get('/getannouncement', (req, res) => {
  res.json(hirdetesek);
});
app.get('/getimages', (req, res) => {
  const { adId } = req.query;
  const image = uploadedImages.filter((img) => Number(img.adId) === Number(adId));
  res.json(image);
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
