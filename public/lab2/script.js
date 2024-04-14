const form = document.getElementById('form-id');
const startButton = document.getElementById('start');
const feladatokCanvas = document.getElementById('muveletek-canvas');
const eredmenyekCanvas = document.getElementById('eredmenyek-canvas');
const randomEredmenyek = [];
let jatekIndult = false;
const feladatok = [];
const eredmenyek = [];

function feladatokGeneralasa(muveletek) {
  for (let i = 0; i < form.kerdesek.value; ++i) {
    const randomMuvelet = Math.random() * muveletek.length;
    const szam1 = Math.floor(Math.random() * 100);
    const szam2 = Math.floor(Math.random() * 100);
    feladatok.push(`${szam1} ${muveletek[Math.floor(randomMuvelet)]} ${szam2}`);
    if (muveletek[Math.floor(randomMuvelet)] === '+') {
      eredmenyek.push(`${szam1 + szam2}`);
      randomEredmenyek.push(`${szam1 + szam2}`);
    } else if (muveletek[Math.floor(randomMuvelet)] === '-') {
      eredmenyek.push(`${szam1 - szam2}`);
      randomEredmenyek.push(`${szam1 - szam2}`);
    } else if (muveletek[Math.floor(randomMuvelet)] === '*') {
      eredmenyek.push(`${szam1 * szam2}`);
      randomEredmenyek.push(`${szam1 * szam2}`);
    } else if (muveletek[Math.floor(randomMuvelet)] === '/') {
      eredmenyek.push(`${szam1 / szam2}`);
      randomEredmenyek.push(`${szam1 / szam2}`);
    }
  }
}
function feladatokRajzolas() {
  const canvas = feladatokCanvas.getContext('2d');
  canvas.clearRect(0, 0, feladatokCanvas.width, feladatokCanvas.height);
  for (let i = 0; i < form.kerdesek.value; ++i) {
    const x = 10;
    const y = i * 50 + 20;
    canvas.fillStyle = 'red';
    canvas.fillRect(x, y, feladatokCanvas.width - 20, 30);
    canvas.fillStyle = 'white';
    canvas.font = '20px Times New Roman';
    canvas.fillText(feladatok[i], x + 10, y + 20);
  }
}
function keveres() {
  let currentIndex = randomEredmenyek.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [randomEredmenyek[currentIndex], randomEredmenyek[randomIndex]] = [
      randomEredmenyek[randomIndex],
      randomEredmenyek[currentIndex],
    ];
  }
}
function megoldasokRajzolas() {
  const canvas = eredmenyekCanvas.getContext('2d');
  canvas.clearRect(0, 0, eredmenyekCanvas.width, eredmenyekCanvas.height);
  keveres();
  for (let i = 0; i < form.kerdesek.value; ++i) {
    console.log(eredmenyek[i]);
    console.log(randomEredmenyek[i]);
  }
  for (let i = 0; i < form.kerdesek.value; ++i) {
    const x = 10;
    const y = i * 50 + 20;
    canvas.fillStyle = 'green';
    canvas.fillRect(x, y, eredmenyekCanvas.width - 20, 30);
    canvas.fillStyle = 'red';
    canvas.font = '20px Times New Roman';
    canvas.fillText(randomEredmenyek[i], x + 10, y + 20);
  }
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
    feladatokGeneralasa(muveletek);
    feladatokRajzolas();
    megoldasokRajzolas();
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
    eredmenyekCanvas.getContext('2d').clearRect(0, 0, eredmenyekCanvas.width, eredmenyekCanvas.height);
    feladatokCanvas.getContext('2d').clearRect(0, 0, feladatokCanvas.width, feladatokCanvas.height);

    jatekIndult = false;
  }
}
startButton.addEventListener('click', jatek);
