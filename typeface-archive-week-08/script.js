
const typefaces = [
  {
    name: 'MONUMENT',
    font: 'Impact, "Arial Narrow", sans-serif',
    weight: 900,
    description: 'Heavy display / Condensed sans'
  },
  {
    name: 'EDITORIAL',
    font: 'Georgia, "Times New Roman", serif',
    weight: 900,
    description: 'Bold display / Expressive serif'
  },
  {
    name: 'SYSTEM',
    font: '"Courier New", monospace',
    weight: 900,
    description: 'Industrial / Monospaced'
  },
  {
    name: 'CLASSIC',
    font: 'Georgia, serif',
    weight: 700,
    description: 'Traditional / Heavy serif'
  },
  {
    name: 'NEUTRAL',
    font: 'Arial, Helvetica, sans-serif',
    weight: 900,
    description: 'Modern / Ultra-bold sans'
  }
];

const sample = document.getElementById('sample');
const choices = document.getElementById('choices');

let selected = 0;

function showTypeface(index) {
  selected = index;
  const face = typefaces[selected];

  sample.textContent = 'Ag';
  sample.style.fontFamily = face.font;
  sample.style.fontWeight = face.weight;

  document.getElementById('font-name').textContent = face.name;
  document.getElementById('description').textContent = face.description;
  document.getElementById('counter').textContent =
    `${String(selected + 1).padStart(2, '0')} — 05`;

  document.querySelectorAll('.choice').forEach((button, i) => {
    button.classList.toggle('active', i === selected);
    button.setAttribute('aria-pressed', String(i === selected));
  });
}

typefaces.forEach((face, i) => {
  const button = document.createElement('button');

  button.className = 'choice';
  button.innerHTML = `
    <span>${String(i + 1).padStart(2, '0')}</span>
    <span>${face.name.length > 7 ? face.name.slice(0, 5) : face.name}</span>
  `;

  button.setAttribute('aria-label', `Show ${face.name}`);
  button.addEventListener('click', () => showTypeface(i));

  choices.appendChild(button);
});

document.getElementById('next').addEventListener('click', () => {
  showTypeface((selected + 1) % typefaces.length);
});

showTypeface(0);
