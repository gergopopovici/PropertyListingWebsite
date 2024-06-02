import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
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
const secret = '92e001516475925247579858f731b6c65f178002bbb93c12cf3b09afeaceeca6';
app.use('/uploads', express.static(uploadDir));
app.use(cookieParser());
const upload = multer({ dest: uploadDir, limits: { fileSize: 5000000 } });
router.get(['/', '/index'], async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, secret);
    const { felhasznalo } = decoded;
    const hirdetesek = await db.getHirdetesek();
    console.log(felhasznalo.Nev);
    return res.render('index', { title: 'index', hirdetesek, felhasznalo });
  }
  const hirdetesek = await db.getHirdetesek();
  return res.render('index', { title: 'index', hirdetesek });
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
  res.render('index', { title: 'index', hirdetesek });
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
  return res.status(500).render('kepfeltolt', { title: 'Képek', message: 'Hiba történt a kép feltöltése során' });
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
router.post(
  '/submitregistration_form',
  express.urlencoded({ extended: true }),
  [
    check('felhasznalonev').isString().isLength({ min: 1 }).withMessage('Felhasználónév megadása kötelező!'),
    check('jelszo').isString().isLength({ min: 1 }).withMessage('Jelszó megadása kötelező!'),
    check('jelszo2').isString().isLength({ min: 1 }).withMessage('Jelszó megadása kötelező!'),
    check('jelszo').custom((value, { req }) => {
      if (value !== req.body.jelszo2) {
        throw new Error('A két jelszó nem egyezik!');
      }
      return true;
    }),
    check('email').isEmail().withMessage('Érvényes email címet adjon meg!'),
    check('felhasznalonev').custom(async (value) => {
      const felhasznalo = await db.getFelhasznaloNev(value);
      if (felhasznalo.length > 0) {
        throw new Error('A felhasználónév foglalt!');
      }
      return true;
    }),
    check('email').custom(async (value) => {
      const felhasznalo = await db.getFelhasznaloEmail(value);
      if (felhasznalo.length > 0) {
        throw new Error('Az email cím foglalt!');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res
        .status(500)
        .render('regisztracio', { message: `Hiba történt a validálás során: ${errorMessages.join(', ')}` });
    }
    const hashSize = 30;
    const saltSize = 30;
    const hashAlgorithm = 'sha512';
    const iterations = 1000;
    const salt = crypto.randomBytes(saltSize);
    const hash = await crypto.pbkdf2Sync(req.body.jelszo, salt, iterations, hashSize, hashAlgorithm);
    const hashWithSalt = `${hash.toString('base64')}:${salt.toString('base64')}`;
    const beszurt = await db.insertFelhasznalo(
      req.body.nev,
      req.body.felhasznalonev,
      req.body.email,
      hashWithSalt,
      salt.toString('base64'),
    );
    if (beszurt === 1) {
      return res.redirect('/login');
    }
    return res.status(500).render('regisztracio', { message: 'Hiba történt a beszurás során' });
  },
);
router.post(
  '/submitlogin_form',
  express.urlencoded({ extended: true }),
  [
    check('felhasznalonev').isString().isLength({ min: 1 }).withMessage('Felhasználónév megadása kötelező!'),
    check('jelszo').isString().isLength({ min: 1 }).withMessage('Jelszó megadása kötelező!'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).render('bejelentkezes', { message: 'Hiba történt a validálás során' });
    }
    const felhasznalo = await db.getLogindData(req);
    if (felhasznalo.Length === 0) {
      return res.status(401).render('bejelentkezes', { messsage: 'Nem található ilyen felhasználó' });
    }
    const jelszoHash = felhasznalo[0].Jelszo;
    const so = felhasznalo[0].Salt;
    const hash = await crypto.pbkdf2Sync(req.body.jelszo, Buffer.from(so, 'base64'), 1000, 30, 'sha512');
    const hashWithSalt = `${hash.toString('base64')}:${so}`;
    if (jelszoHash !== hashWithSalt) {
      return res.status(401).render('bejelentkezes', { message: 'Hibás jelszó' });
    }
    const token = jwt.sign({ felhasznalo: { Nev: req.body.felhasznalonev } }, secret, {
      expiresIn: '1h',
    });
    res.cookie('token', token, { httpOnly: true });
    return res.redirect('/index');
  },
);
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/index');
});
export default router;
