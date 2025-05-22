const addChildBtn = document.getElementById('addChildBtn');
const childButtonsContainer = document.getElementById('childButtons');

let children = JSON.parse(localStorage.getItem('barn')) || [];

function saveChildren() {
  localStorage.setItem('barn', JSON.stringify(children));
}

function renderChildren() {
  childButtonsContainer.innerHTML = '';
  children.forEach(child => {
    const button = document.createElement('button');
    button.textContent = child.name;
    button.onclick = () => {
      window.location.href = `registrer.html?barn=${encodeURIComponent(child.name)}`;
    };
    childButtonsContainer.appendChild(button);
  });
}

addChildBtn.addEventListener('click', () => {
  const name = prompt('Hva heter barnet?');
  const birth = prompt('Hva er fødselsdatoen? (YYYY-MM-DD)');
  if (!name || !birth) return;

  const existing = children.find(c => c.name === name.trim());
  if (existing) {
    alert('Barnet finnes allerede.');
    return;
  }

  children.push({ name: name.trim(), birth });
  saveChildren();
  renderChildren();
});

renderChildren();
