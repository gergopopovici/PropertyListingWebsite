let form = document.getElementById('form-id');
let startButton = document.getElementById('start');
let jatekIndult = false
startButton.addEventListener('click',jatek);

function jatek(event){
    event.preventDefault();
    if(!jatekIndult) {
        form.felhasznalonev.disabled = true;
        form.osszeadas.disabled = true;
        form.kivonas.disabled = true;
        form.szorzas.disabled = true;
        form.osztas.disabled = true;
        form.kerdesek.disabled = true;
        jatekIndult = true;
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
