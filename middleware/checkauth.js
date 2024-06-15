import jwt from 'jsonwebtoken';

export default function checkAuth(req, res, next) {
  const { loginToken } = req.cookies;
  if (loginToken) {
    jwt.verify(loginToken, '92e001516475925247579858f731b6c65f178002bbb93c12cf3b09afeaceeca6', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      req.felhasznalo = decoded;
      return next();
    });
  } else {
    res.redirect('/login');
  }
}
