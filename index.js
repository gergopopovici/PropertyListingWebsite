import express from 'express';

const app = express();
const hirdetesek = [];
app.use(express.static(`${process.cwd()}/public`));
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
app.get('/getannouncement', (req, res) => {
  res.json(hirdetesek);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
