
const home = document.querySelector('#home');
const stage = document.querySelector('#stage');
const overlay = document.querySelector('#transition');
const pages = [...document.querySelectorAll('.page')];
const dialog = document.querySelector('#art-dialog');

const colors = {
  visit: '#dcf970',
  explore: '#ffbbdf',
  michel: '#ff5f4a',
  estate: '#000'
};

const reduced = matchMedia('(prefers-reduced-motion: reduce)');

let busy = false;
let current = 'home';
let lastBubble;


// --------------------------------
// 1. Responsive Layout
// --------------------------------

function layout() {
  const w = innerWidth;
  const h = innerHeight;
  const mobile = w < 700;

  const scale = mobile
    ? Math.min(w / 790, (h - 64) / 1100)
    : w / 1440;

  stage.style.width = `${w / scale}px`;
  stage.style.height = `${h / scale}px`;
  stage.style.transform = `scale(${scale})`;
  stage.style.transformOrigin = 'top left';

  const bubbles = document.querySelectorAll('.bubble');

  if (mobile) {
    const positions = {
      visit: [24, 210],
      michel: [397, 195],
      explore: [50, 620],
      estate: [410, 650],
      'decor-orange': [200, -90],
      'decor-green': [280, 1000],
      'decor-yellow': [690, 470],
      'decor-pink': [-200, 820]
    };

    bubbles.forEach(bubble => {
      const key =
        bubble.dataset.page ||
        [...bubble.classList].find(c => c.startsWith('decor'));

      const [x, y] = positions[key];

      bubble.style.left = `${x + (w / scale - 790) / 2}px`;
      bubble.style.top = `${y}px`;
    });
  } else {
    bubbles.forEach(bubble => {
      bubble.style.left = '';
      bubble.style.top = '';
    });
  }
}

layout();
addEventListener('resize', layout);


// --------------------------------
// 2. Page Navigation
// --------------------------------

async function navigate(target, push = true) {
  if (busy || target === current) return;

  if (!colors[target]) {
    target = 'home';
  }

  busy = true;
  dialog.close();

  const from = current;
  const bubble = document.querySelector(
    `[data-page="${target}"]`
  );

  // Bubble expansion animation
  if (target !== 'home' && from === 'home' && bubble) {
    lastBubble = bubble;

    const r = bubble.querySelector('.float').getBoundingClientRect();

    const cx = r.x + r.width / 2;
    const cy = r.y + r.height / 2;

    const diameter =
      Math.hypot(
        Math.max(cx, innerWidth - cx),
        Math.max(cy, innerHeight - cy)
      ) * 2 + 20;

    Object.assign(overlay.style, {
      display: 'block',
      left: `${r.x}px`,
      top: `${r.y}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      background: colors[target],
      transform: 'scale(1)'
    });

    overlay.replaceChildren();

    // Clone bubble label
    const label = bubble.querySelector('span').cloneNode(true);

    Object.assign(label.style, {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: 'BBH Hegarty',
      fontSize: `${48 * r.width / 376}px`,
      lineHeight: '1.2',
      color: getComputedStyle(bubble.querySelector('span')).color
    });

    overlay.append(label);

    // Fade out label
    label.animate(
      [
        { opacity: 1 },
        { opacity: 0 }
      ],
      {
        duration: reduced.matches ? 0 : 300,
        fill: 'forwards'
      }
    );

    bubble.classList.add('leaving');
    home.inert = true;

    // Expand bubble to fill screen
    await overlay.animate(
      [
        { transform: 'scale(1)' },
        { transform: `scale(${diameter / r.width})` }
      ],
      {
        duration: reduced.matches ? 0 : 850,
        easing: 'cubic-bezier(.65,0,.2,1)',
        fill: 'forwards'
      }
    ).finished;
  }

  // Update visible page
  window.scrollTo(0, 0);

  pages.forEach(page => {
    page.hidden = page.id !== target;
    page.classList.remove('reveal');
  });

  home.hidden = target !== 'home';
  home.inert = target !== 'home';

  document.body.dataset.page = target;
  document.body.style.background = colors[target] || '#fff';

  current = target;

  if (target !== 'home') {
    document.querySelector(`#${target}`).classList.add('reveal');
  } else {
    document.querySelectorAll('.leaving').forEach(bubble => {
      bubble.classList.remove('leaving');
    });

    lastBubble?.focus({ preventScroll: true });
  }

  // Reset transition overlay
  overlay.getAnimations().forEach(animation => {
    animation.cancel();
  });

  overlay.style.display = 'none';

  // Update browser history
  if (push) {
    history.pushState(
      { page: target },
      '',
      `#${target}`
    );
  }

  // Update document title
  const titles = {
    michel: 'Michel Majerus',
    estate: 'The Estate',
    visit: 'Visit',
    explore: 'Explore'
  };

  document.title = target === 'home'
    ? 'Michel Majerus — Estate'
    : `${titles[target]} — Michel Majerus`;

  busy = false;
}


// --------------------------------
// 3. Navigation Events
// --------------------------------

// Bubble buttons
document.querySelectorAll('.bubble[data-page]').forEach(bubble => {
  bubble.addEventListener('click', () => {
    navigate(bubble.dataset.page);
  });
});

// Home link
document.querySelector('#home-link').addEventListener('click', event => {
  event.preventDefault();
  navigate('home');
});

// Browser back / forward
addEventListener('popstate', () => {
  navigate(location.hash.slice(1) || 'home', false);
});


// --------------------------------
// 4. Artwork Dialog
// --------------------------------

// Open artwork
document.querySelectorAll('.work').forEach(work => {
  work.addEventListener('click', () => {
    const image = document.querySelector('#art-image');
    const caption = document.querySelector('#art-caption');

    image.src = `assets/${work.dataset.image}`;
    image.alt = work.dataset.title;
    caption.textContent = work.dataset.title;

    dialog.showModal();
    document.body.classList.add('locked');
  });
});

// Close artwork
document.querySelector('#close-art').onclick = () => {
  dialog.close();
};

// Unlock scrolling
dialog.addEventListener('close', () => {
  document.body.classList.remove('locked');
});


// --------------------------------
// 5. Keyboard Navigation
// --------------------------------

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !dialog.open) {
    navigate('home');
  }
});


// --------------------------------
// 6. Initial Page
// --------------------------------

const initialPage = location.hash.slice(1);

if (colors[initialPage]) {
  navigate(initialPage, false);
}
