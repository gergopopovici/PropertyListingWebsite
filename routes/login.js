import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { check, validationResult } from 'express-validator';
import * as db from '../db/db.js';

const app = express();
app.use(express.json());
const router = express.Router();
app.use(cookieParser());
const secret = '92e001516475925247579858f731b6c65f178002bbb93c12cf3b09afeaceeca6';
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
      expiresIn: '10m',
    });
    res.cookie('loginToken', token, { httpOnly: true });
    return res.redirect('/index');
  },
);
export default router;
