import express from 'express';
import multer from 'multer';
import path from 'path';
import { check, validationResult } from 'express-validator';
import { existsSync, mkdirSync } from 'fs';
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
  res.render('index', { hirdetesek });
});
router.get(['/hirdetes'], async (req, res) => {
  const felhasznalo = await db.getFelhasznalok();
  res.render('hirdetes', { felhasznalok: felhasznalo });
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
  res.render('kepfeltolt', { hirdetes, kepek });
});

router.post('/submitpic_form', upload.single('kep'), async (req, res) => {
  const beszurt = await db.insertPic(req);
  if (beszurt === 1) {
    return res.redirect(`/tovabb?id=${req.body.adId}`);
  }
  return res.status(500).render('kepfeltolt', { message: 'Hiba történt a kép feltöltése során' });
});

router.get('/hirdetes/:id', async (req, res) => {
  const { id } = req.params;
  const hirdetes = await db.getHirdetes(id);
  console.log(hirdetes);
  res.json(hirdetes);
});

export default router;
