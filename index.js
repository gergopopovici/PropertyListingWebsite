import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import requestRoutes from './routes/requests.js';

const app = express();
const uploadDir = path.join(process.cwd(), 'uploadDir');
app.use(express.static(`${process.cwd()}/public`));
app.use('/uploads', express.static(uploadDir));
app.set('view engine', 'hbs');
app.set('views', path.join(process.cwd(), 'views'));
app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    defaultView: 'main',
    layoutsDir: path.join(process.cwd(), 'views/layouts'),
    partialsDir: path.join(process.cwd(), 'views/partials'),
  }),
);
app.use('/', requestRoutes);
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
