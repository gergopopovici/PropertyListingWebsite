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

function checkFormKep() {
  const adId = document.getElementById('adId').value;
  const image = document.getElementById('kep').value;
  if (/[^0-9]/.test(adId)) {
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
  if (/[^a-zA-Z]/.test(varos)) {
    alert('A város neve nem lehet szám!');
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
  if (/[^0-9]/.test(felszinterulet)) {
    alert('A felszínterület csak szám lehet!');
    return false;
  }
  if (ar < 0) {
    alert('Az ár nem lehet negatív szám!');
    return false;
  }
  if (/[^0-9]/.test(ar)) {
    alert('Az ár csak szám lehet!');
    return false;
  }
  if (szobak < 0) {
    alert('A szobák száma nem lehet negatív szám!');
    return false;
  }
  if (/[^0-9]/.test(szobak)) {
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

function moreInfo(data, moreInformation) {
  while (moreInformation.firstChild) {
    moreInformation.removeChild(moreInformation.firstChild);
  }
  const szobak = document.createElement('p');
  szobak.textContent = `Szobák száma: ${data.Szobak}`;
  moreInformation.appendChild(szobak);
  const datum = document.createElement('p');
  datum.textContent = `Hirdetés dátuma: ${data.Datum}`;
  moreInformation.appendChild(datum);
}

const clearButton = document.getElementById('clear');
const clearKepButton = document.getElementById('clear-kep');
const clearHirdetButton = document.getElementById('clear-hirdet');
const submitButtonKep = document.getElementById('feltolt');
const submitButtonHirdet = document.getElementById('hirdet');
const sorElements = document.querySelectorAll('.sor');
const deleteKepElements = document.querySelectorAll('.delete-kep');

if (clearButton) {
  clearButton.addEventListener('click', clearIndex);
  sorElements.forEach((sorElement) => {
    sorElement.addEventListener('click', (event) => {
      let { target } = event;
      while (target != null && !target.classList.contains('hirdetes')) {
        target = target.parentElement;
      }
      const id = target.getAttribute('hirdetes-id');
      fetch(`/hirdetes/${id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Hiba történt a kérés során');
          }
          return res.json();
        })
        .then((hirdetes) => {
          const moreInformation = document.getElementById(id);
          moreInfo(hirdetes[0], moreInformation);
        })
        .catch((err) => {
          console.error(err);
          alert('Hiba történt a kérés során');
        });
    });
  });
}
if (clearKepButton) {
  clearKepButton.addEventListener('click', clearKep);
  deleteKepElements.forEach((deleteKepElement) => {
    deleteKepElement.addEventListener('click', (event) => {
      const id = event.target.getAttribute('kep-id');
      fetch(`/kep/${id}`, { method: 'DELETE' })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Hiba történt a kérés során');
          }
          return res;
        })
        .then(() => {
          event.target.parentElement.remove();
        })
        .catch((err) => {
          console.error(err);
          alert('hiba történt a kérés során');
        });
    });
  });
}
if (clearHirdetButton) {
  clearHirdetButton.addEventListener('click', clearHirdet);
}
if (submitButtonKep) {
  submitButtonKep.addEventListener('click', (event) => {
    if (!checkFormKep()) {
      event.preventDefault();
    }
  });
}

if (submitButtonHirdet) {
  submitButtonHirdet.addEventListener('click', (event) => {
    if (!checkFormHirdet()) {
      event.preventDefault();
    }
  });
}
