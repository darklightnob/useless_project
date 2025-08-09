const overlay = document.getElementById('overlay');
const statusText = document.getElementById('statusText');
const regionName = document.getElementById('regionName');
const cardMsg = document.getElementById('cardMsg');
const dismiss = document.getElementById('dismiss');
const alertAll = document.getElementById('alertAll');

let audioCtx = null;
function beep(freq = 880, dur = 0.10, vol = 0.06) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.stop(audioCtx.currentTime + dur + 0.02);
  } catch (e) {
    console.warn('Audio blocked', e);
  }
}

function sparkBeamAt(region) {
  const hotspot = document.querySelector(`.hotspot[data-region="${region}"]`);
  if (!hotspot) return;
  const parent = hotspot.closest('.earth');
  const hr = hotspot.getBoundingClientRect();
  const pr = parent.getBoundingClientRect();
  const beam = document.createElement('div');
  beam.className = 'beam';
  const cx = hr.left + hr.width / 2 - pr.left;
  const cy = hr.top + hr.height / 2 - pr.top;
  beam.style.left = (cx - 6) + 'px';
  beam.style.top = (cy + 8) + 'px';
  parent.appendChild(beam);
  requestAnimationFrame(() => {
    beam.style.opacity = '1';
    beam.style.height = '160px';
  });
  setTimeout(() => {
    beam.style.opacity = '0';
    beam.style.height = '0';
  }, 700);
  setTimeout(() => beam.remove(), 1200);
}

function flashHUD() {
  const hud = document.querySelector('.hud');
  if (!hud) return;
  hud.animate([
    { boxShadow: '0 0 0 rgba(255,59,59,0)' },
    { boxShadow: '0 0 18px rgba(255,59,59,0.45)' },
    { boxShadow: '0 0 0 rgba(255,59,59,0)' }
  ], { duration: 900, iterations: 2 });
}

function showAlertFor(region) {
  regionName.textContent = region;
  cardMsg.innerHTML = `Alien presence detected in <strong>${region}</strong>.<br>
    Strange lights and anomalous readings reported.<br><br>
    Recommendation: avoid contact and follow instructions.`;
  overlay.style.display = 'grid';
  overlay.setAttribute('aria-hidden', 'false');
  statusText.textContent = 'ALERT';
  sparkBeamAt(region);
  beep(720, 0.10, 0.06);
  setTimeout(() => beep(920, 0.08, 0.05), 140);
  setTimeout(() => beep(1120, 0.06, 0.04), 260);
  flashHUD();
}

function closeOverlay() {
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
  statusText.textContent = 'Monitoring';
  beep(520, 0.08, 0.04);
}

document.querySelectorAll('.hotspot').forEach(btn => {
  btn.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    const region = btn.dataset.region;
    beep(720 + Math.random() * 160, 0.09, 0.06);
    setTimeout(() => showAlertFor(region), 160);
  });
});

dismiss.addEventListener('click', closeOverlay);

alertAll.addEventListener('click', () => {
  alertAll.disabled = true;
  alertAll.textContent = 'Broadcasting...';
  let t = 0;
  const id = setInterval(() => {
    beep(360 + Math.random() * 240, 0.06, 0.03);
    t++;
    if (t > 6) {
      clearInterval(id);
      alertAll.textContent = 'Sent';
      setTimeout(() => {
        closeOverlay();
        alertAll.disabled = false;
        alertAll.textContent = 'Broadcast Warning';
      }, 900);
    }
  }, 260);
});

overlay.addEventListener('pointerdown', e => {
  if (e.target === overlay) closeOverlay();
});
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOverlay();
});

document.addEventListener('pointerdown', function resume() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  document.removeEventListener('pointerdown', resume);
}, { once: true });
