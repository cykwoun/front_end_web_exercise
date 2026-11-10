const form = document.querySelector('#trip-form');
const list = document.querySelector('#items');
const feedback = document.querySelector('#feedback');
const progress = document.querySelector('#progress');

function suggestedItems(temperature, weather) {
  const items = [
    ['Phone charger', 'Every trip'],
    ['Toiletries', 'Every trip'],
    ['Comfortable shoes', 'Every trip']
  ];

  if (temperature < 10) {
    items.push(['Warm coat', 'Cold weather']);
  } else if (temperature < 22) {
    items.push(['Light jacket', 'Mild weather']);
  } else {
    items.push(['Sunscreen', 'Warm weather']);
  }

  if (weather === 'rain') {
    items.push(['Umbrella', 'Rain forecast']);
  }

  if (weather === 'snow') {
    items.push(['Waterproof boots', 'Snow forecast']);
  }

  return items;
}

function updateProgress() {
  const total = list.querySelectorAll('input[type="checkbox"]').length;
  const packed = list.querySelectorAll('input[type="checkbox"]:checked').length;

  progress.textContent = `${packed} of ${total} packed`;
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const destination = document.querySelector('#destination').value.trim();
  const temperature = Number(document.querySelector('#temperature').value);
  const weatherSelect = document.querySelector('#weather');

  if (!destination || !Number.isFinite(temperature)) {
    return;
  }

  list.replaceChildren();

  for (const [name, reason] of suggestedItems(
    temperature,
    weatherSelect.value
  )) {
    const row = document.createElement('li');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    const text = document.createElement('span');
    const title = document.createElement('span');
    const note = document.createElement('small');

    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', updateProgress);

    text.className = 'item-text';
    title.textContent = name;
    note.textContent = reason;

    text.append(title, note);
    label.append(checkbox, text);
    row.append(label);
    list.append(row);
  }

  feedback.textContent =
    `Packing list for ${destination} · ${temperature}°C · ` +
    weatherSelect.selectedOptions[0].textContent;

  updateProgress();
});