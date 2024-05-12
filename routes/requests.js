import express from 'express';
import * as db from '../db/db.js';

const router = express.Router();
router.get('/felhasznalok', async (req, res) => {
  try {
    const Felhasznalok = await db.getFelhasznalok();
    res.render('felhasznalok', { Felhasznalok });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

export default router;
