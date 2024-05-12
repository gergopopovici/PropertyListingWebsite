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
    Cim NVARCHAR(MAX),
    Tartalom NVARCHAR(MAX),
    FOREIGN KEY (FelhasznaloID) REFERENCES Felhasznalo(FelhasznaloID)
 )`,
);

await pool.query(
  `IF NOT EXISTS(SELECT * FROM sysobjects WHERE name='Fenykep' and xtype='U')
  CREATE TABLE Fenykep (
    FenykepID INT PRIMARY KEY,
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

export const insertHirdetes = async (req) => {
  const userQuery = 'SELECT FelhasznaloID FROM Felhasznalo WHERE Nev = @Nev AND Email = @Email';
  const userResult = await pool.request().input('Nev', req.Nev).input('Email', req.Email).query(userQuery);

  if (userResult.recordset.length === 0) {
    throw new Error('User not found');
  }

  const { FelhasznaloID } = userResult.recordset[0];

  const query = 'INSERT INTO Hirdetes (FelhasznaloID, Cim, Tartalom) VALUES (@FelhasznaloID, @Cim, @Tartalom)';
  return pool
    .request()
    .input('FelhasznaloID', FelhasznaloID)
    .input('Cim', req.Cim)
    .input('Tartalom', req.Tartalom)
    .query(query);
};
export const getFelhasznalok = async () => {
  const query = 'SELECT * FROM Felhasznalo';
  const result = await pool.query(query);
  return 'recordset' in result ? result.recordset : [];
};
