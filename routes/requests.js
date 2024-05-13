import express from 'express';
import { check, validationResult } from 'express-validator';
import * as db from '../db/db.js';

const app = express();
app.use(express.json());
const router = express.Router();
router.get(['/', '/index'], async (req, res) => {
  try {
    const hirdetesek = await db.getHirdetesek();
    console.log(hirdetesek);
    res.render('index', { hirdetesek });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});
router.get(['/hirdetes'], async (req, res) => {
  try {
    const felhasznalo = await db.getFelhasznalok();
    res.render('hirdetes', { felhasznalok: felhasznalo });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
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
      console.log(req.body.varos);
      return res.redirect('/hirdetes');
    }
    // const { felhasznalo, varos, kerulet, felszinterulet, ar, szobak, datum } = req.body;
    // console.log(felhasznalo, varos);
    const beszurt = await db.insertHirdetes(req);
    if (beszurt === 1) {
      return res.redirect('/index');
    }
    return res.redirect('/submitannouncement_form');
  },
);

export default router;
