import express from 'express';
import multer from 'multer';
import path from 'path';
import { check, validationResult } from 'express-validator';
import fs, { existsSync, mkdirSync } from 'fs';
import * as db from '../db/db.js';
import verifyToken from '../middleware/verifyToken.js';
import checkOwner from '../middleware/checkOwner.js';
import checkOwnerPic from '../middleware/checkOwnerPic.js';
import checkAdmin from '../middleware/checkadm.js';
import checkAuth from '../middleware/checkaut.js';

const app = express();
app.use(express.json());
app.use(verifyToken);
app.use(checkOwner);
app.use(checkOwnerPic);
app.use(checkAdmin);
app.use(checkAuth);
const uploadDir = path.join(process.cwd(), 'uploadDir');
const router = express.Router();
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));
const upload = multer({ dest: uploadDir, limits: { fileSize: 5000000 } });

router.post(
  '/submitannouncement_form',
  verifyToken,
  checkAuth,
  express.urlencoded({ extended: true }),
  [
    check('varos').isString().isLength({ min: 4 }).withMessage('Város megadása kötelező!'),
    check('kerulet').isString().isLength({ min: 1 }).withMessage('Kerület megadása kötelező!'),
    check('felszinterulet').isInt({ min: 10 }).withMessage('A felszínterület minimum 10m^2 kell legyen.'),
    check('ar').isInt({ min: 1 }).withMessage('Az ár értéke pozitív szám kell legyen.'),
    check('szobak').isInt({ min: 1 }).withMessage('A szobák száma legalább egy kell legyen.'),
    check('datum').isDate().withMessage('A dátum érvényes dátum formátumban kell legyen.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).render('hirdetes', {
        felhasznalo: req.felhasznalo,
        message: `Hiba történt a validálás során${errors.array()}`,
      });
    }
    const felhasznaloNev = req.body.username;
    const felhasznaloID = (await db.getFelhasznaloID(felhasznaloNev))[0]?.FelhasznaloID;
    if (!felhasznaloID) {
      return res.status(404).render('hirdetes', { felhasznalo: req.felhasznalo, message: 'Nem található felhasználó' });
    }
    const beszurt = await db.insertHirdetes(
      felhasznaloID,
      req.body.varos,
      req.body.kerulet,
      req.body.felszinterulet,
      req.body.ar,
      req.body.szobak,
      req.body.datum,
    );
    if (beszurt === 1) {
      return res.redirect('/index');
    }
    return res
      .status(500)
      .render('hirdetes', { felhasznalo: req.felhasznalo, message: 'Hiba történt a beszurás során' });
  },
);

router.delete('/kep/:id', verifyToken, checkOwnerPic, async (req, res) => {
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

router.delete('/hirdetesek/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const kepek = await db.getPic(id);
    if (kepek.length > 0) {
      for (const kep of kepek) {
        const toroltKep = await db.deletePic(kep.FenykepID);
        if (!toroltKep) {
          return res.status(500).json({ message: 'A kép törlése nem sikerült' });
        }
        fs.unlinkSync(path.join(uploadDir, kep.Fajlnev));
      }
    }
    const torolt = await db.deleteHirdetes(id);
    if (torolt) {
      return res.status(200).end();
    }
    return res.status(500).json({ message: 'A hirdetés törlése nem sikerült' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Szerverhiba' });
  }
});

router.delete('/hirdetesUserDelete/:id', verifyToken, checkOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const kepek = await db.getPic(id);
    if (kepek.length > 0) {
      for (const kep of kepek) {
        const toroltKep = await db.deletePic(kep.FenykepID);
        if (!toroltKep) {
          return res.status(500).json({ message: 'A kép törlése nem sikerült' });
        }
        fs.unlinkSync(path.join(uploadDir, kep.Fajlnev));
      }
    }
    const torolt = await db.deleteHirdetes(id);
    if (torolt) {
      return res.status(200).end();
    }
    return res.status(500).json({ message: 'A hirdetés törlése nem sikerült' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Szerverhiba' });
  }
});

export default router;