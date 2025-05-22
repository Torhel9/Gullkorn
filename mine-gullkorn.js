// mine-gullkorn.js

const gullkornListe   = document.getElementById("gullkornListe");
const filterKort      = document.getElementById("filterKort");
const filterKnapper   = document.getElementById("filterKnapper");
const sokeFelt        = document.getElementById("sokeFelt");

let barn           = JSON.parse(localStorage.getItem("barn")   || "[]");
let gullkorn       = JSON.parse(localStorage.getItem("gullkorn")|| "[]");
let redigerIndex   = null;
let currentFilter  = "alle";

/**
 * Gjør om et kort-element til bilde og deler det via Web Share API eller åpner det i ny fane.
 */
async function delGullkornBilde(kortElem, korn) {
  try {
    const canvas = await html2canvas(kortElem, { backgroundColor: korn.color, scale: 2 });
    const blob   = await new Promise(res => canvas.toBlob(res, 'image/png'));
    const file   = new File([blob], `gullkorn-${korn.barn}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Gullkorn fra ${korn.barn}`,
        text: `"${korn.tekst}" — ${korn.alder}`
      });
    } else {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  } catch (err) {
    console.error(err);
    alert('Kunne ikke generere bilde for deling.');
  }
}

// Åpner filter-modal og viser barneknapper, sortert etter alder (eldst først)
function visFilterKnapper() {
  filterKnapper.innerHTML = "";
  const sortertBarn = [...barn].sort((a, b) => new Date(a.birth) - new Date(b.birth));

  const alleKnapp = document.createElement("button");
  alleKnapp.textContent = "Vis alle";
  alleKnapp.onclick = () => velgBarn("alle");
  filterKnapper.appendChild(alleKnapp);

  sortertBarn.forEach(b => {
    const knapp = document.createElement("button");
    knapp.textContent = b.name;
    knapp.style.backgroundColor = b.color;
    knapp.style.color = "#000";
    knapp.onclick = () => velgBarn(b.name);
    filterKnapper.appendChild(knapp);
  });

  filterKort.style.display = "flex";
}

// Lukker filter-modal
function hideFilter() {
  filterKort.style.display = "none";
}

// Setter filter og oppdaterer visning
function velgBarn(filterBarn) {
  hideFilter();
  currentFilter = filterBarn;
  visGullkorn(filterBarn);
}

// Viser gullkorn med formatering og ikoner
function visGullkorn(filterBarn = "alle") {
  gullkornListe.innerHTML = "";
  let filtrert = filterBarn === "alle" 
    ? [...gullkorn] 
    : gullkorn.filter(g => g.barn === filterBarn);

  if (filtrert.length === 0) {
    gullkornListe.innerHTML = "<p>Ingen gullkorn registrert.</p>";
    return;
  }

  filtrert.forEach((korn, index) => {
    // Formater dato: "Lørdag 5. Mai 2025"
    const datoObj = new Date(korn.dato);
    const opts = { weekday:'long', day:'numeric', month:'long', year:'numeric' };
    let datoStr = datoObj.toLocaleDateString('no-NO', opts)
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    // Bygg kortet
    const kort = document.createElement("div");
    kort.className = "quote-card";
    kort.style.position = "relative";

    kort.innerHTML = `
      <strong>${korn.barn}</strong>
      <p>"${korn.tekst}"</p>
      <small>${datoStr} (${korn.alder})</small>
    `;

    // Ikon-wrapper
    const ikonWrapper = document.createElement("div");
    ikonWrapper.style.position = "absolute";
    ikonWrapper.style.top = "0.5rem";
    ikonWrapper.style.right = "0.75rem";

    if (filterBarn !== "alle") {
      // Rediger
      const redigerIkon = document.createElement("span");
      redigerIkon.innerHTML = "✎";
      redigerIkon.title = "Rediger";
      redigerIkon.style.cursor = "pointer";
      redigerIkon.style.marginRight = "0.5rem";
      redigerIkon.onclick = () => startRedigering(index);
      ikonWrapper.appendChild(redigerIkon);

      // Slett
      const slettIkon = document.createElement("span");
      slettIkon.innerHTML = "🗑";
      slettIkon.title = "Slett";
      slettIkon.style.cursor = "pointer";
      slettIkon.onclick = () => slettGullkorn(index);
      ikonWrapper.appendChild(slettIkon);

      // Del som bilde
      const delIkon = document.createElement("span");
      delIkon.innerHTML = "📤";
      delIkon.title = "Del som bilde";
      delIkon.style.cursor = "pointer";
      delIkon.style.marginLeft = "0.5rem";
      delIkon.onclick = () => delGullkornBilde(kort, korn);
      ikonWrapper.appendChild(delIkon);
    }

    kort.appendChild(ikonWrapper);
    gullkornListe.appendChild(kort);
  });
}

// Åpner rediger-modal
function startRedigering(index) {
  redigerIndex = index;
  document.getElementById("redigerTekst").value = gullkorn[index].tekst;
  document.getElementById("redigerModal").style.display = "flex";
}

// Lagre endring fra rediger-modal
function lagreEndring() {
  const nyTekst = document.getElementById("redigerTekst").value.trim();
  if (nyTekst && redigerIndex !== null) {
    gullkorn[redigerIndex].tekst = nyTekst;
    localStorage.setItem("gullkorn", JSON.stringify(gullkorn));
    visGullkorn(currentFilter);
    lukkRedigerModal();
  }
}

// Lukk rediger-modal
function lukkRedigerModal() {
  document.getElementById("redigerModal").style.display = "none";
  redigerIndex = null;
}

// Slett gullkorn
function slettGullkorn(index) {
  if (confirm("Er du sikker på at du vil slette dette gullkornet?")) {
    gullkorn.splice(index, 1);
    localStorage.setItem("gullkorn", JSON.stringify(gullkorn));
    visGullkorn(currentFilter);
  }
}

// Live-søk
sokeFelt.addEventListener("input", function() {
  const søk = this.value.toLowerCase();
  document.querySelectorAll(".quote-card").forEach(k => {
    k.style.display = k.textContent.toLowerCase().includes(søk) ? "block" : "none";
  });
});

// Init
visFilterKnapper();
