import express from 'express';

const app = express();

app.use(express.static(`${process.cwd()}/public`));
app.post('/submit_form', (req, res) => {
  res.send('Form submitted');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
