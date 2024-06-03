import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import * as db from '../db/db.js';

const app = express();
app.use(express.json());
const uploadDir = path.join(process.cwd(), 'uploadDir');
const router = express.Router();
const secret = '92e001516475925247579858f731b6c65f178002bbb93c12cf3b09afeaceeca6';
app.use('/uploads', express.static(uploadDir));
app.use(cookieParser());
router.get(['/', '/index'], async (req, res) => {
  const { logintoken } = req.cookies;
  if (logintoken) {
    const decoded = jwt.verify(logintoken, secret);
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
router.get('/tovabb', async (req, res) => {
  const { id } = req.query;
  const hirdetes = await db.getHirdetes(id);
  const kepek = await db.getPic(id);
  res.render('kepfeltolt', { title: 'Képek', hirdetes, kepek });
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
  res.cookie('logintoken', '', { expires: new Date(0) });
  res.redirect('/index');
});
export default router;
