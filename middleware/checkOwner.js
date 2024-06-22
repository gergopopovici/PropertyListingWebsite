import jwt from 'jsonwebtoken';
import * as db from '../db/db.js';

const secret = '92e001516475925247579858f731b6c65f178002bbb93c12cf3b09afeaceeca6';
export default async function checkOwner(req, res, next) {
  try {
    const { loginToken } = req.cookies;
    const decoded = jwt.verify(loginToken, secret);
    const { felhasznalo } = decoded;
    if (!felhasznalo) {
      return res.status(401).send('Nem vagy bejelentkezve');
    }
    const felhasznaloID = (await db.getFelhasznaloID(felhasznalo.Nev))[0].FelhasznaloID;
    let adID;
    if (req.body && req.body.adId) {
      adID = req.body.adId;
    } else {
      adID = req.params.id;
    }
    const hirdetes = await db.checkFelhasznaloOwner(felhasznaloID, adID);
    if (hirdetes.length === 0) {
      return res.status(403).send('Nem vagy a hirdetés tulajdonosa');
    }

    return next();
  } catch (error) {
    return res.status(500).send('Hiba történt az ellenőrzés során');
  }
}
