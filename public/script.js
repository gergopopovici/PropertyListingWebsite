function clearIndex() {
  document.getElementById('varos').value = '';
  document.getElementById('kerulet').value = '';
  document.getElementById('minar').value = '';
  document.getElementById('maxar').value = '';
}
function clearKep() {
  document.getElementById('kep').value = '';
}
function clearHirdet() {
  document.getElementById('varos').value = '';
  document.getElementById('kerulet').value = '';
  document.getElementById('felszinterulet').value = '';
  document.getElementById('ar').value = '';
  document.getElementById('szobak').value = '';
  document.getElementById('datum').value = '';
}
function clearLogin() {
  document.getElementById('felhasznalonev').value = '';
  document.getElementById('jelszo').value = '';
}
function clearRegisterForm() {
  document.getElementById('felhasznalonev').value = '';
  document.getElementById('jelszo').value = '';
  document.getElementById('email').value = '';
  document.getElementById('nev').value = '';
  document.getElementById('jelszo2').value = '';
}
function checkFormUzenet() {
  const cimzet = document.getElementById('felhasznaloValaszto').value;
  const uzenet = document.getElementById('uzenet').value;
  if (cimzet === '') {
    alert('Válasszon címzettet!');
    return false;
  }
  if (uzenet === '') {
    alert('Írjon üzenetet!');
    return false;
  }
  return true;
}
function checkUzenetMegtekint() {
  const felhasznalo = document.getElementById('felhasznaloValaszto2').value;
  if (felhasznalo === '') {
    alert('Válasszon felhaszálót!');
    return false;
  }
  return true;
}
function checkFormLogin() {
  const felhasznalonev = document.getElementById('felhasznalonev').value;
  const jelszo = document.getElementById('jelszo').value;
  if (felhasznalonev === '') {
    alert('Adja meg a felhasználónevet!');
    return false;
  }
  if (jelszo === '') {
    alert('Adja meg a jelszót!');
    return false;
  }
  return true;
}
function checkFormKep() {
  const adId = document.getElementById('adId').value;
  const image = document.getElementById('kep').value;
  if (/\D/.test(adId)) {
    alert('Az azonosító csak szám lehet!');
    return false;
  }
  if (adId === '') {
    alert('Adja meg a hirdetés azonosítóját!');
    return false;
  }
  if (image === '') {
    alert('Töltse fel a képet!');
    return false;
  }
  const validImage = ['jpg', 'jpeg', 'png'];
  const ext = image.split('.').pop().toLowerCase();
  if (!validImage.includes(ext)) {
    alert('Csak jpg, jpeg és png formátumú képet lehet feltölteni!');
    return false;
  }
  return true;
}

function checkFormHirdet() {
  const varos = document.getElementById('varos').value;
  const kerulet = document.getElementById('kerulet').value;
  const felszinterulet = document.getElementById('felszinterulet').value;
  const ar = document.getElementById('ar').value;
  const szobak = document.getElementById('szobak').value;
  const datum = document.getElementById('datum').value;
  if (varos === '') {
    alert('Adja meg a város nevét!');
    return false;
  }
  if (/[^a-zA-Z-]/.test(varos)) {
    alert('A város neve nem tartalmazhat szóközt vagy számot!');
    return false;
  }

  if (kerulet === '') {
    alert('Adja meg a kerületet!');
    return false;
  }
  if (felszinterulet < 10) {
    alert('A felszínterület nem lehet kevesebb mint 10m^2!');
    return false;
  }
  if (/\D/.test(felszinterulet)) {
    alert('A felszínterület csak szám lehet!');
    return false;
  }
  if (ar < 0) {
    alert('Az ár nem lehet negatív szám!');
    return false;
  }
  if (/\D/.test(ar)) {
    alert('Az ár csak szám lehet!');
    return false;
  }
  if (szobak < 0) {
    alert('A szobák száma nem lehet negatív szám!');
    return false;
  }
  if (/\D/.test(szobak)) {
    alert('A szobák száma csak szám lehet!');
    return false;
  }
  if (datum === '') {
    alert('Adja meg a hirdetés dátumát!');
    return false;
  }
  if (new Date(datum) > new Date()) {
    alert('A dátum nem lehet a jövőben!');
    return false;
  }
  return true;
}

function checkFormRegister() {
  const felhasznalonev = document.getElementById('felhasznalonev').value;
  const jelszo = document.getElementById('jelszo').value;
  const email = document.getElementById('email').value;
  const nev = document.getElementById('nev').value;
  const jelszo2 = document.getElementById('jelszo2').value;
  if (nev === '') {
    alert('Adja meg a nevet!');
    return false;
  }
  if (felhasznalonev === '') {
    alert('Adja meg a felhasználónevet!');
    return false;
  }
  if (email === '') {
    alert('Adja meg az email címet!');
    return false;
  }
  if (jelszo === '') {
    alert('Adja meg a jelszót!');
    return false;
  }
  if (jelszo2 === '') {
    alert('Adja meg a jelszót mégegyszer!');
    return false;
  }
  if (jelszo !== jelszo2) {
    alert('A két jelszó nem egyezik!');
    return false;
  }
  return true;
}