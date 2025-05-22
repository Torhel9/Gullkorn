const urlParams = new URLSearchParams(window.location.search);
const barnNavn = urlParams.get("barn");
const barnNavnTittel = document.getElementById("barnNavnTittel");
const visDato = document.getElementById("visDato");
const visAlder = document.getElementById("visAlder");
const gullkornForm = document.getElementById("gullkornForm");
const gullkornTekst = document.getElementById("gullkornTekst");

if (!barnNavn) {
  alert("Ingen barn valgt.");
  window.location.href = "index.html";
}

barnNavnTittel.textContent = `Registrer gullkorn for ${barnNavn}`;

const iDag = new Date();
const datoStr = iDag.toISOString().split("T")[0];
visDato.textContent = datoStr;

// Finn fødselsdato
let barnListe = JSON.parse(localStorage.getItem("barn") || "[]");
let valgtBarn = barnListe.find(b => b.name === barnNavn);

if (!valgtBarn) {
  alert("Barnet ble ikke funnet.");
  window.location.href = "index.html";
}

// Funksjon for detaljert alder i år og måneder
function kalkulerAlderDetaljert(fodselsdatoStr, referansedato = new Date()) {
  const fodsel = new Date(fodselsdatoStr);
  let år = referansedato.getFullYear() - fodsel.getFullYear();
  let måneder = referansedato.getMonth() - fodsel.getMonth();
  let dager = referansedato.getDate() - fodsel.getDate();

  if (dager < 0) {
    måneder -= 1;
  }
  if (måneder < 0) {
    år -= 1;
    måneder += 12;
  }

  return `${år} år og ${måneder} måned${måneder === 1 ? '' : 'er'}`;
}

const alderStr = kalkulerAlderDetaljert(valgtBarn.birth, iDag);
visAlder.textContent = alderStr;

gullkornForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const gullkorn = {
    barn: barnNavn,
    tekst: gullkornTekst.value,
    dato: datoStr,
    alder: alderStr
  };

  const lagrede = JSON.parse(localStorage.getItem("gullkorn") || "[]");
  lagrede.push(gullkorn);
  localStorage.setItem("gullkorn", JSON.stringify(lagrede));
  alert("Gullkorn lagret!");
  gullkornForm.reset();
});
