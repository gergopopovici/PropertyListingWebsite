import sql from 'mssql';

const pool = await sql.connect({
  server: 'GERGO',
  user: 'lakas',
  password: 'lakas',
  database: 'hirdeto',
  options: {
    trustServerCertificate: true,
    trustedConnection: true,
  },
});
await pool.query(
  `IF NOT EXISTS(SELECT * FROM sysobjects WHERE name='Csoport' and xtype='U')
  CREATE TABLE Csoport(
    CsoportID INT PRIMARY KEY IDENTITY(1,1),
    CsoportNev NVARCHAR(MAX)
  )`,
);
await pool.query(
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Felhasznalo' and xtype='U')
  CREATE TABLE Felhasznalo(  
  FelhasznaloID INT PRIMARY KEY IDENTITY(1,1),
    Nev NVARCHAR(MAX), 
    Email NVARCHAR(MAX),
    FelhasznaloNev NVARCHAR(MAX),
    Jelszo NVARCHAR(MAX),
    Salt NVARCHAR(MAX),
    CsoportID INT
    FOREIGN KEY (CsoportID) REFERENCES Csoport(CsoportID)
)`,
);
await pool.query(
  `IF NOT EXISTS(SELECT * FROM sysobjects WHERE name='Hirdetes' and xtype='U')
 CREATE TABLE Hirdetes(
    HirdetesID INT PRIMARY KEY IDENTITY(1,1),
    FelhasznaloID INT,
    Varos NVARCHAR(MAX),
    Kerulet NVARCHAR(MAX),
    Felszinterulet INT,
    Ar INT,
    Szobak INT,
    Datum DATE,
    FOREIGN KEY (FelhasznaloID) REFERENCES Felhasznalo(FelhasznaloID)
 )`,
);

await pool.query(
  `IF NOT EXISTS(SELECT * FROM sysobjects WHERE name='Fenykep' and xtype='U')
  CREATE TABLE Fenykep (
    FenykepID INT PRIMARY KEY IDENTITY(1,1),
    Fajlnev NVARCHAR(255),
    HirdetesID INT,
    FOREIGN KEY (HirdetesID) REFERENCES Hirdetes(HirdetesID)
);`,
);
await pool.query(
  `IF NOT EXISTS (SELECT * FROM Csoport)
  BEGIN
    INSERT INTO Csoport (CsoportNev) VALUES ('Admin');
    INSERT INTO Csoport (CsoportNev) VALUES ('Felhasznalo');
    INSERT INTO Csoport (CsoportNev) VALUES ('Vendeg');
  END;`,
);
export const insertHirdetes = (felhasznaloID, varos, kerulet, felszinterulet, ar, szobak, datum) => {
  const query =
    'INSERT INTO Hirdetes (FelhasznaloID,Varos, Kerulet,Felszinterulet,Ar,Szobak,Datum) VALUES (@FelhasznaloID,@Varos, @Kerulet,@Felszinterulet,@Ar,@Szobak,@Datum)';
  return pool
    .request()
    .input('FelhasznaloID', felhasznaloID)
    .input('Varos', varos)
    .input('Kerulet', kerulet)
    .input('Felszinterulet', felszinterulet)
    .input('Ar', ar)
    .input('Szobak', szobak)
    .input('Datum', datum)
    .query(query)
    .then(() => 1);
};
export const getFelhasznalok = async () => {
  const query = 'SELECT * FROM Felhasznalo';
  const result = await pool.query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const getHirdetesek = async () => {
  const query = 'SELECT * FROM Hirdetes';
  const result = await pool.query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const getHirdetes = async (id) => {
  const query = 'SELECT * FROM Hirdetes WHERE HirdetesID = @HirdetesID';
  const result = await pool.request().input('HirdetesID', id).query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const getKeresettHirdetesek = async (req) => {
  let query = 'SELECT * FROM Hirdetes WHERE 1=1';
  const request = pool.request();

  if (req.body.varos) {
    query += ' AND Varos = @Varos';
    request.input('Varos', req.body.varos);
  }

  if (req.body.kerulet) {
    query += ' AND Kerulet = @Kerulet';
    request.input('Kerulet', req.body.kerulet);
  }
  if (req.body.minar) {
    query += ' AND Ar >= @MinAr';
    request.input('MinAr', req.body.minar);
  }
  if (req.body.maxar) {
    query += ' AND Ar <= @MaxAr';
    request.input('MaxAr', req.body.maxar);
  }
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const insertPic = (req) => {
  const query = 'INSERT INTO Fenykep (Fajlnev,HirdetesID) VALUES (@Fajlnev,@HirdetesID)';
  return pool
    .request()
    .input('Fajlnev', req.file.filename)
    .input('HirdetesID', req.body.adId)
    .query(query)
    .then(() => 1);
};
export const getPic = async (id) => {
  const query = 'SELECT * FROM Fenykep WHERE HirdetesID = @HirdetesID';
  const result = await pool.request().input('HirdetesID', id).query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const deletePic = async (id) => {
  const query = 'DELETE FROM Fenykep WHERE FenykepID = @FenykepID';
  const result = await pool.request().input('FenykepID', id).query(query);
  return result.rowsAffected[0] > 0;
};
export const getPicById = async (id) => {
  const query = 'SELECT Fajlnev FROM Fenykep WHERE FenykepID = @FenykepID';
  const result = await pool.request().input('FenykepID', id).query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const insertFelhasznalo = (nev, felhasznalonev, email, jelszo, salt) => {
  const query =
    'INSERT INTO Felhasznalo (Nev,Email,Jelszo,Salt,FelhasznaloNev) VALUES (@Nev,@Email,@Jelszo,@Salt,@FelhasznaloNev)';
  return pool
    .request()
    .input('Nev', nev)
    .input('Email', email)
    .input('Jelszo', jelszo)
    .input('Salt', salt)
    .input('FelhasznaloNev', felhasznalonev)
    .query(query)
    .then(() => 1);
};
export const getFelhasznaloNev = async (felhasznaloNev) => {
  const query = 'SELECT FelhasznaloNev FROM Felhasznalo WHERE FelhasznaloNev = @FelhasznaloNev';
  const result = await pool.request().input('FelhasznaloNev', felhasznaloNev).query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const getFelhasznaloEmail = async (email) => {
  const query = 'SELECT Email FROM Felhasznalo WHERE Email = @Email';
  const result = await pool.request().input('Email', email).query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const getLogindData = async (req) => {
  const query = 'SELECT * FROM Felhasznalo WHERE FelhasznaloNev = @FelhasznaloNev';
  const result = await pool.request().input('FelhasznaloNev', req.body.felhasznalonev).query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const getFelhasznaloID = async (felhasznaloNev) => {
  const query = 'SELECT FelhasznaloID FROM Felhasznalo WHERE FelhasznaloNev = @FelhasznaloNev';
  const result = await pool.request().input('FelhasznaloNev', felhasznaloNev).query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const checkFelhasznaloOwner = async (felhasznaloID, hirdetesID) => {
  const query = 'SELECT * FROM Hirdetes WHERE FelhasznaloID = @FelhasznaloID AND HirdetesID = @HirdetesID';
  const result = await pool
    .request()
    .input('FelhasznaloID', felhasznaloID)
    .input('HirdetesID', hirdetesID)
    .query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const getHirdetesByPic = async (picID) => {
  const query = 'SELECT HirdetesID FROM Fenykep WHERE FenykepID = @FenykepID';
  const result = await pool.request().input('FenykepID', picID).query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const upgradeAdmin = async (felhasznaloID) => {
  const query = 'UPDATE Felhasznalo SET CsoportID = 1 WHERE FelhasznaloID = @FelhasznaloID';
  const result = await pool.request().input('FelhasznaloID', felhasznaloID).query(query);
  return result.rowsAffected[0] > 0;
};
export const downgradeAdmin = async (felhasznaloID) => {
  const query = 'UPDATE Felhasznalo SET CsoportID = 2 WHERE FelhasznaloID = @FelhasznaloID';
  const result = await pool.request().input('FelhasznaloID', felhasznaloID).query(query);
  return result.rowsAffected[0] > 0;
};
export const checkAdmin = async (felhasznaloNev) => {
  const query = 'SELECT * FROM Felhasznalo WHERE FelhasznaloNev = @FelhasznaloNev AND CsoportID = 1';
  const result = await pool.request().input('FelhasznaloNev', felhasznaloNev).query(query);
  return 'recordset' in result ? result.recordset : [];
};
export const deleteHirdetes = async (id) => {
  const query = 'DELETE FROM Hirdetes WHERE HirdetesID = @HirdetesID';
  const result = await pool.request().input('HirdetesID', id).query(query);
  return result.rowsAffected[0] > 0;
};
