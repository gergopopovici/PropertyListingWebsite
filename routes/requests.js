import express from 'express';
import * as db from '../db/db.js';

const router = express.Router();
router.get(['/', '/index'], async (req, res) => {
  try {
    const felhasznalok = await db.getFelhasznalok();
    console.log(felhasznalok);
    res.render('index', { felhasznalok });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});
router.get(['/hirdetes'], async (req, res) => {
  try {
    const felhasznalo = await db.getFelhasznalok();
    console.log(felhasznalo);
    res.render('hirdetes', { felhasznalok: felhasznalo });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});
export default router;
