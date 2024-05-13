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
    FenykepID INT PRIMARY KEY,
    Fajlnev NVARCHAR(255),
    HirdetesID INT,
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

export const insertHirdetes = (req) => {
  const query =
    'INSERT INTO Hirdetes (FelhasznaloID,Varos, Kerulet,Felszinterulet,Ar,Szobak,Datum) VALUES (@FelhasznaloID,@Varos, @Kerulet,@Felszinterulet,@Ar,@Szobak,@Datum)';
  return pool
    .request()
    .input('FelhasznaloID', req.body.felhasznalo)
    .input('Varos', req.body.varos)
    .input('Kerulet', req.body.kerulet)
    .input('Felszinterulet', req.body.felszinterulet)
    .input('Ar', req.body.ar)
    .input('Szobak', req.body.szobak)
    .input('Datum', req.body.datum)
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

export const getKeresettHirdetesek = async (req) => {
  let query = 'SELECT * FROM Hirdetes';
  //  const request = pool.request();
  if (req.body.varos) {
    query += ` WHERE Varos = '${req.body.varos}'`;
    // request.input('Varos', req.body.varos);
  }
  if (req.body.kerulet) {
    query += ` AND Kerulet = '${req.body.kerulet}'`;
    // request.input('Kerulet', req.body.kerulet);
  }
  if (req.body.minar) {
    query += ` AND Ar >= '${req.body.minar}'`;
    // request.input('MinAr', req.body.minar);
  }
  if (req.body.maxar) {
    query += ` AND Ar <= '${req.body.maxar}'`;
    // request.input('MaxAr', req.body.maxar);
  }
  console.log(query);
  const result = await pool.query(query);
  return 'recordset' in result ? result.recordset : [];
};
