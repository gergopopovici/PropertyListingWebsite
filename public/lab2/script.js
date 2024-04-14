const form = document.getElementById('form-id');
const startButton = document.getElementById('start');
let jatekIndult = false;

function feladatokGeneralasa(muveletek) {
  const feladatok = [];
  for (let i = 0; i < form.kerdesek.value; ++i) {
    let randomMuvelet = Math.random() * muveletek;
    randomMuvelet = muveletek[randomMuvelet];
    const szam1 = Math.floor(Math.random() * 100) + 1;
    const szam2 = Math.floor(Math.random() * 100) + 1;
    feladatok.push(`${szam1} ${muveletek[randomMuvelet]} ${szam2}`);
  }
  return feladatok;
}
function jatek(event) {
  event.preventDefault();
  if (!jatekIndult) {
    form.felhasznalonev.disabled = true;
    form.osszeadas.disabled = true;
    form.kivonas.disabled = true;
    form.szorzas.disabled = true;
    form.osztas.disabled = true;
    form.kerdesek.disabled = true;
    jatekIndult = true;
    const muveletek = [];
    if (form.osszeadas.checked) {
      muveletek.push('+');
    }
    if (form.kivonas.checked) {
      muveletek.push('-');
    }
    if (form.szorzas.checked) {
      muveletek.push('*');
    }
    if (form.osztas.checked) {
      muveletek.push('/');
    }
    const feladatok = feladatokGeneralasa(muveletek, form);
  } else {
    form.felhasznalonev.disabled = false;
    form.osszeadas.disabled = false;
    form.kivonas.disabled = false;
    form.szorzas.disabled = false;
    form.osztas.disabled = false;
    form.kerdesek.disabled = false;
    form.osszeadas.checked = false;
    form.kivonas.checked = false;
    form.szorzas.checked = false;
    form.osztas.checked = false;
    form.kerdesek.value = 5;
    jatekIndult = false;
  }
}
startButton.addEventListener('click', jatek);
