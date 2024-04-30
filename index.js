import express from 'express';
import multer from 'multer';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const app = express();
const uploadDir = path.join(process.cwd(), 'uploadDir');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const hirdetesek = [];
app.use(express.static(`${process.cwd()}/public`));
app.use('/uploads', express.static(uploadDir));
const mutlerUpload = multer({ dest: uploadDir, limits: { fileSize: 5000000 } });
const uploadedImages = [];
app.post('/submitannouncement_form', express.urlencoded({ extended: true }), (req, res) => {
  const { varos, kerulet, felszinterulet, ar, szobak, datum } = req.body;
  const ujHirdetes = {
    id: hirdetesek.length + 1,
    varos,
    kerulet,
    felszinterulet,
    ar,
    szobak,
    datum,
  };
  hirdetesek.push(ujHirdetes);
  res.json({ id: ujHirdetes.id });
});
app.post('/submitpic_form', mutlerUpload.single('kep'), (req, res) => {
  const { adId } = req.body;
  const hirdetesExists = hirdetesek.some((hirdetes) => Number(hirdetes.id) === Number(adId));
  if (!hirdetesExists) {
    res.status(400).send('Hirdetés nem található!');
    return;
  }
  const image = req.file;
  uploadedImages.push({ adId, image });
  res.json({ image });
});
app.get('/getannouncement', (req, res) => {
  res.json(hirdetesek);
});
app.get('/getimage', (req, res) => {
  const { adId } = req.query;
  const image = uploadedImages.filter((img) => Number(img.adId) === Number(adId));
  res.json(image);
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
