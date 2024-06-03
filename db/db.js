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
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Felhasznalo' and xtype='U')
  CREATE TABLE Felhasznalo(  
  FelhasznaloID INT PRIMARY KEY IDENTITY(1,1),
    Nev NVARCHAR(100), 
    Email NVARCHAR(100)
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
  `IF NOT EXISTS (SELECT * FROM Felhasznalo)
  BEGIN
    INSERT INTO Felhasznalo (Nev, Email) VALUES ('John Doe', 'john@example.com');
    INSERT INTO Felhasznalo (Nev, Email) VALUES ('Jane Smith', 'jane@example.com');
    INSERT INTO Felhasznalo (Nev, Email) VALUES ('Alice Johnson', 'alice@example.com');
  END;`,
);

await pool.query(`
  IF NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Felhasznalo' AND COLUMN_NAME = 'FelhasznaloNev'
  )
  BEGIN
    ALTER TABLE Felhasznalo ADD FelhasznaloNev NVARCHAR(MAX)
  END
`);

await pool.query(`
  IF NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Felhasznalo' AND COLUMN_NAME = 'Jelszo'
  )
  BEGIN
    ALTER TABLE Felhasznalo ADD Jelszo NVARCHAR(MAX)
  END
`);

await pool.query(`
  IF NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Felhasznalo' AND COLUMN_NAME = 'Salt'
  )
  BEGIN
    ALTER TABLE Felhasznalo ADD Salt NVARCHAR(MAX)
  END
`);

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
