import express from 'express';
import multer from 'multer';
import path from 'path';
import { check, validationResult } from 'express-validator';
import fs, { existsSync, mkdirSync } from 'fs';
import * as db from '../db/db.js';

const app = express();
app.use(express.json());
const uploadDir = path.join(process.cwd(), 'uploadDir');
const router = express.Router();
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));
const upload = multer({ dest: uploadDir, limits: { fileSize: 5000000 } });
router.get(['/', '/index'], async (req, res) => {
  const hirdetesek = await db.getHirdetesek();
  res.render('index', { title: 'index', hirdetesek });
});
router.get(['/hirdetes'], async (req, res) => {
  const felhasznalo = await db.getFelhasznalok();
  res.render('hirdetes', { title: 'hirdetés', felhasznalok: felhasznalo });
});
router.post(
  '/submitannouncement_form',
  express.urlencoded({ extended: true }),
  [
    check('varos').isString().isLength({ min: 1 }).withMessage('Város megadása kötelező!'),
    check('kerulet').isString().isLength({ min: 1 }).withMessage('Kerület megadása kötelező!'),
    check('felszinterulet').isInt({ min: 10 }).withMessage('A felszínterület minimum 10m^2 kell legyen.'),
    check('ar').isInt({ min: 1 }).withMessage('Az ár értéke pozitív szám kell legyen.'),
    check('szobak').isInt({ min: 1 }).withMessage('A szobák száma legalább egy kell legyen.'),
    check('datum').isDate().withMessage('A dátum érvényes dátum formátumban kell legyen.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).render('hirdetes', { message: `Hiba történt a validálás során${errors.array()}` });
    }
    const beszurt = await db.insertHirdetes(req);
    if (beszurt === 1) {
      return res.redirect('/index');
    }
    return res.status(500).render('hirdetes', { message: 'Hiba történt a beszurás során' });
  },
);
router.post('/submit_form', express.urlencoded({ extended: true }), async (req, res) => {
  const hirdetesek = await db.getKeresettHirdetesek(req);
  res.render('index', { hirdetesek });
});
router.get('/tovabb', async (req, res) => {
  const { id } = req.query;
  const hirdetes = await db.getHirdetes(id);
  const kepek = await db.getPic(id);
  res.render('kepfeltolt', { title: 'Képek', hirdetes, kepek });
});

router.post('/submitpic_form', upload.single('kep'), async (req, res) => {
  const beszurt = await db.insertPic(req);
  if (beszurt === 1) {
    return res.redirect(`/tovabb?id=${req.body.adId}`);
  }
  return res.status(500).render('kepfeltolt', { message: 'Hiba történt a kép feltöltése során' });
});

router.get('/hirdetes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hirdetes = await db.getHirdetes(id);
    if (!hirdetes) {
      return res.status(404).json({ message: 'Hirdetés nem található' });
    }
    return res.json(hirdetes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Szerverhiba' });
  }
});
router.delete('/kep/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const kep = await db.getPicById(id);
    if (!kep || kep.length === 0) {
      return res.status(404).json({ message: 'Kép nem található' });
    }
    const torolt = await db.deletePic(id);
    if (torolt) {
      fs.unlinkSync(path.join(uploadDir, kep[0].Fajlnev));
      return res.status(200).end();
    }
    return res.status(500).json({ message: 'A kép törlése nem sikerült' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Szerverhiba' });
  }
});
router.get('/register', (req, res) => {
  res.render('regisztracio', { title: 'Regisztráció' });
});
router.get('/login', (req, res) => {
  res.render('bejelentkezes', { title: 'Bejelentkezés' });
});
export default router;
