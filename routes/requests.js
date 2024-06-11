import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import * as db from '../db/db.js';
import checkAuth from '../middleware/checkauth.js';
import verifyToken from '../middleware/verifyToken.js';

const app = express();
app.use(express.json());
const uploadDir = path.join(process.cwd(), 'uploadDir');
const router = express.Router();
app.use('/uploads', express.static(uploadDir));
app.use(cookieParser());
app.use(checkAuth);
app.use(verifyToken);
router.get(['/', '/index'], verifyToken, async (req, res) => {
  const hirdetesek = await db.getHirdetesek();
  res.render('index', { title: 'index', hirdetesek, felhasznalo: req.felhasznalo });
});
router.get(['/hirdetes'], checkAuth, verifyToken, (req, res) =>
  res.render('hirdetes', { title: 'hirdetés', felhasznalo: req.felhasznalo }),
);
router.get('/tovabb', verifyToken, async (req, res) => {
  const { id } = req.query;
  let tulaj = false;
  if (req.felhasznalo) {
    const hirdetes = await db.getHirdetes(id);
    const felhasznaloID = (await db.getFelhasznaloID(req.felhasznalo.Nev))[0].FelhasznaloID;
    if (hirdetes[0].FelhasznaloID === felhasznaloID) {
      tulaj = true;
    }
  }
  const hirdetes = await db.getHirdetes(id);
  const kepek = await db.getPic(id);
  return res.render('kepfeltolt', { title: 'Képek', hirdetes, kepek, tulaj, felhasznalo: req.felhasznalo });
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
router.get('/register', (req, res) => {
  res.render('regisztracio', { title: 'Regisztráció' });
});
router.get('/login', (req, res) => {
  res.render('bejelentkezes', { title: 'Bejelentkezés' });
});
router.get('/logout', (req, res) => {
  res.cookie('loginToken', '', { expires: new Date(0) });
  res.redirect('/index');
});
export default router;
