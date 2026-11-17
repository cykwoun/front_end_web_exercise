const form = document.querySelector('#trip-form');
const list = document.querySelector('#items');
const feedback = document.querySelector('#feedback');
const progress = document.querySelector('#progress');
const summary = document.querySelector('#weather-summary');
const submitButton = document.querySelector('#submit-button');

function describeWeather(code) {
  if (code === 0) return { label: 'Clear sky', kind: 'dry' };
  if ([1, 2, 3].includes(code)) return { label: 'Cloudy', kind: 'dry' };
  if ([45, 48].includes(code)) return { label: 'Foggy', kind: 'dry' };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
    return { label: 'Rain or showers', kind: 'rain' };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snowy', kind: 'snow' };
  return { label: 'Mixed conditions', kind: 'dry' };
}

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

  if (weather === 'rain') items.push(['Umbrella', 'Rain forecast']);
  if (weather === 'snow') items.push(['Waterproof boots', 'Snow forecast']);
  return items;
}

function updateProgress() {
  const total = list.querySelectorAll('input[type="checkbox"]').length;
  const packed = list.querySelectorAll('input[type="checkbox"]:checked').length;
  progress.textContent = `${packed} of ${total} packed`;
}

function showItems(items) {
  list.replaceChildren();
  for (const [name, reason] of items) {
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
  updateProgress();
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather service is unavailable. Please try again.');
  return response.json();
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const destination = document.querySelector('#destination').value.trim();
  if (!destination) return;

  submitButton.disabled = true;
  submitButton.textContent = 'Loading weather...';
  feedback.textContent = `Looking up weather for ${destination}...`;
  summary.hidden = true;
  summary.replaceChildren();
  list.replaceChildren();
  updateProgress();

  try {
    // First request: translate a city name into coordinates.
    const locationURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`;
    const locationData = await fetchJSON(locationURL);
    if (!locationData.results?.length) {
      feedback.textContent = 'No matching destination found. Try a different city name.';
      return;
    }

    const place = locationData.results[0];
    // Second request: get current weather at those coordinates.
    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&timezone=auto`;
    const weatherData = await fetchJSON(weatherURL);
    const current = weatherData.current;
    if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.weather_code)) {
      throw new Error('No current weather data was returned. Try another city.');
    }

    const temperature = Math.round(current.temperature_2m);
    const weather = describeWeather(current.weather_code);
    const placeName = [place.name, place.country].filter(Boolean).join(', ');
    feedback.textContent = `Packing list for ${placeName}`;
    summary.textContent = `${temperature}°C · ${weather.label} · Current weather`;
    summary.hidden = false;
    showItems(suggestedItems(temperature, weather.kind));
  } catch (error) {
    feedback.textContent = error.message || 'Could not load the weather. Please try again.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Check weather & make list';
  }
});
