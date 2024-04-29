function clearIndex() {
  document.getElementById('varos').value = '';
  document.getElementById('kerulet').value = '';
  document.getElementById('minar').value = '';
  document.getElementById('maxar').value = '';
}
function clearKep() {
  document.getElementById('adId').value = '';
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

function checkFormIndex() {
  const varos = document.getElementById('varos').value;
  const minar = document.getElementById('minar').value;
  const maxar = document.getElementById('maxar').value;
  if (varos === '') {
    alert('Adja meg a kereset város nevét!');
    return false;
  }
  if (minar !== '' && maxar !== '' && parseInt(minar, 10) > parseInt(maxar, 10)) {
    alert('A minimum ár nem lehet nagyobb a maximum árnál!');
    return false;
  }
  if (minar < 0 || maxar < 0) {
    alert('Az ár nem lehet negatív szám!');
    return false;
  }
  return true;
}

function checkFormKep() {
  const adId = document.getElementById('adId').value;
  const image = document.getElementById('kep').value;
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
  if (kerulet === '') {
    alert('Adja meg a kerületet!');
    return false;
  }
  if (felszinterulet < 10) {
    alert('A felszínterület nem lehet kevesebb mint 10m^2!');
    return false;
  }
  if (ar < 0) {
    alert('Az ár nem lehet negatív szám!');
    return false;
  }
  if (szobak < 0) {
    alert('A szobák száma nem lehet negatív szám!');
    return false;
  }
  if (datum === '') {
    alert('Adja meg a hirdetés dátumát!');
    return false;
  }

  return true;
}

function hirdetesek() {
  fetch('/getannouncement')
    .then((res) => res.json())
    .then((data) => {
      const nagyDiv = document.getElementById('nagy-div');
      nagyDiv.innerText = '';
      data.forEach((hirdetes) => {
        const hirdetesDiv = document.createElement('div');
        hirdetesDiv.classList.add('hirdetes');
        hirdetesDiv.innerHTML = `
          <h2>${hirdetes.varos} ${hirdetes.kerulet}</h2>
          <p>Felszínterület: ${hirdetes.felszinterulet} m^2</p>
          <p>Ár: ${hirdetes.ar} RON</p>
          <p>Szobák száma: ${hirdetes.szobak}</p>
          <p>Dátum: ${hirdetes.datum}</p>
        `;
        nagyDiv.appendChild(hirdetesDiv);
      });
    });
}

const clearButton = document.getElementById('clear');
const clearKepButton = document.getElementById('clear-kep');
const clearHirdetButton = document.getElementById('clear-hirdet');
const submitButtonIndex = document.getElementById('keres');
const submitButtonKep = document.getElementById('feltolt');
const submitButtonHirdet = document.getElementById('hirdet');

if (clearButton) {
  clearButton.addEventListener('click', clearIndex);
}
if (clearKepButton) {
  clearKepButton.addEventListener('click', clearKep);
}
if (clearHirdetButton) {
  clearHirdetButton.addEventListener('click', clearHirdet);
}
if (submitButtonIndex) {
  submitButtonIndex.addEventListener('click', checkFormIndex);
}
if (submitButtonKep) {
  submitButtonKep.addEventListener('click', checkFormKep);
}
if (submitButtonHirdet) {
  submitButtonHirdet.addEventListener('click', checkFormHirdet);
}
if (clearButton) {
  hirdetesek();
}
