import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import * as db from '../db/db.js';
import checkAuth from '../middleware/checkauth.js';
import verifyToken from '../middleware/verifyToken.js';

const app = express();
app.use(express.json());
const uploadDir = path.join(process.cwd(), 'uploadDir');
const router = express.Router();
const secret = '92e001516475925247579858f731b6c65f178002bbb93c12cf3b09afeaceeca6';
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
router.get('/tovabb', async (req, res) => {
  const { loginToken } = req.cookies;
  const { id } = req.query;
  let decoded;
  let tulaj = false;
  if (loginToken) {
    try {
      decoded = jwt.verify(loginToken, secret);
      const { felhasznalo } = decoded;
      const felhasznaloID = (await db.getFelhasznaloID(felhasznalo.Nev))[0].FelhasznaloID;
      const ellenoriz = await db.checkFelhasznaloOwner(felhasznaloID, id);
      if (ellenoriz.length > 0) {
        tulaj = true;
        const hirdetes = await db.getHirdetes(id);
        const kepek = await db.getPic(id);
        return res.render('kepfeltolt', { title: 'Képek', felhasznalo, hirdetes, kepek, tulaj });
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        res.cookie('loginToken', '', { expires: new Date(0) });
        return res.redirect('/index');
      }
    }
  }
  const hirdetes = await db.getHirdetes(id);
  const kepek = await db.getPic(id);
  return res.render('kepfeltolt', { title: 'Képek', hirdetes, kepek, tulaj });
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
