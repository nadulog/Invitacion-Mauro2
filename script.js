(() => {
  const toast = document.getElementById("toast");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Aviso ---------- */
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };

  /* ---------- Nombres de invitados ----------
     Los completa assets/invitation-personalization.js a partir de ?invite=<token>.
     Acá solo se achica la letra cuando los nombres son largos. */
  const guestEl = document.getElementById("nombres-invitados");
  const fitGuestNames = () => {
    const len = guestEl.textContent.trim().length;
    guestEl.classList.toggle("is-long", len > 12 && len <= 20);
    guestEl.classList.toggle("is-very-long", len > 20);
  };
  new MutationObserver(fitGuestNames).observe(guestEl, { childList: true, characterData: true, subtree: true });

  /* ---------- Cuenta regresiva: sábado 23 de enero de 2027, 21:00 (hora Argentina) ---------- */
  const target = new Date("2027-01-23T21:00:00-03:00").getTime();
  const cd = ["cdDays", "cdHours", "cdMinutes", "cdSeconds"].map((id) => document.getElementById(id));
  const pad = (n) => String(n).padStart(2, "0");
  // Aguja del cronómetro: marca los segundos reales, siempre avanzando (nunca vuelve para atrás)
  const hand = document.getElementById("watchHand");
  const handStart = Math.floor(Date.now() / 1000);
  const handOffset = new Date().getSeconds();
  const tick = () => {
    const nowSec = Math.floor(Date.now() / 1000);
    hand.style.transform = `rotate(${(nowSec - handStart + handOffset) * 6}deg)`;
    const s = Math.floor(Math.max(0, target - Date.now()) / 1000);
    [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].forEach((v, i) => {
      const text = pad(v);
      if (cd[i].textContent === text) return;
      cd[i].textContent = text;
      if (!reducedMotion) {
        cd[i].classList.remove("flick");
        void cd[i].offsetWidth;
        cd[i].classList.add("flick");
      }
    });
  };
  tick();
  setInterval(tick, 1000);

  /* ---------- Papelitos azul y oro en la portada ----------
     Cada papelito cae a ritmo parejo (<i>), se hamaca de lado a lado y da vueltas
     en el aire mostrando el brillo de sus dos caras (<b>), como el papel picado de verdad. */
  if (!reducedMotion) {
    const box = document.querySelector(".papelitos");
    const colors = [
      "linear-gradient(135deg, #f8e2a2, #c9973f)",
      "linear-gradient(135deg, #fff1c4, #e2b765)",
      "linear-gradient(135deg, #e9c574, #a8741f)",
      "linear-gradient(135deg, #3a63c9, #1d3b8a)",
      "linear-gradient(135deg, #5a7fe0, #2a4fb0)",
      "linear-gradient(135deg, #ffffff, #e9dcc0)",
    ];
    const rand = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 34; i++) {
      const p = document.createElement("i");
      const b = document.createElement("b");
      const fall = rand(4.2, 6.4);
      p.style.setProperty("--x", `${rand(-2, 100)}%`);
      p.style.setProperty("--t", `${fall}s`);
      p.style.setProperty("--d", `${-rand(0, fall)}s`);
      b.style.setProperty("--w", `${rand(1.6, 2.8)}cqw`);
      b.style.setProperty("--h", `${rand(0.45, 0.7)}`);
      b.style.setProperty("--c", colors[i % colors.length]);
      b.style.setProperty("--sway", `${rand(2.5, 6)}cqw`);
      b.style.setProperty("--s", `${rand(0.9, 1.6)}s`);
      b.style.setProperty("--sd", `${-rand(0, 1.6)}s`);
      b.style.setProperty("--f", `${rand(0.8, 1.8)}s`);
      b.style.setProperty("--rx", rand(0.3, 1).toFixed(2));
      b.style.setProperty("--ry", rand(0.2, 1).toFixed(2));
      b.style.setProperty("--dir", Math.random() < 0.5 ? "normal" : "reverse");
      p.append(b);
      box.append(p);
    }
  }

  /* ---------- Fotos dentro de las polaroid ----------
     Deforma cada recuadro para que sus 4 esquinas caigan sobre las de la ventana
     de la foto en la imagen (perspectiva), y lo recalcula si cambia el tamaño. */
  const quadMatrix = (w, h, p) => {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = p;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = (dx3 * dy2 - dx2 * dy3) / den;
    const hh = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3;
    const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
    return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, x0, y0, 0, 1].join(",")})`;
  };
  const pols = document.querySelectorAll(".pol");
  const placePols = () => {
    pols.forEach((pol) => {
      const scale = pol.parentElement.clientWidth / 941;
      const quad = pol.dataset.quad.split(" ").map((pt) => pt.split(",").map((n) => Number(n) * scale));
      pol.style.transform = quadMatrix(pol.offsetWidth, pol.offsetHeight, quad);
    });
  };
  placePols();
  if ("ResizeObserver" in window) new ResizeObserver(placePols).observe(pols[0].parentElement);
  else addEventListener("resize", placePols);

  /* ---------- Aparición de textos ---------- */
  if (!reducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-revealed");
        io.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------- Música de fondo ----------
     Los celulares no dejan que suene sola: arranca cuando el invitado elige
     "Entrar con música" en la intro, y después se prende o apaga con el botón dorado. */
  const music = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicToggle");
  const setMusicUi = (playing) => {
    musicBtn.classList.toggle("is-playing", playing);
    musicBtn.setAttribute("aria-pressed", String(playing));
    musicBtn.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
  };
  const playMusic = () => {
    music.volume = 0.8;
    const p = music.play();
    if (p && p.catch) p.catch(() => setMusicUi(false));
  };
  music.addEventListener("play", () => setMusicUi(true));
  music.addEventListener("pause", () => setMusicUi(false));
  musicBtn.addEventListener("click", () => {
    if (music.paused) playMusic();
    else music.pause();
  });

  /* ---------- Intro: entrar con o sin música ---------- */
  const root = document.documentElement;
  const intro = document.getElementById("intro");
  root.classList.add("is-intro");
  intro.querySelectorAll("[data-music]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.music === "on") playMusic();
      root.classList.remove("is-intro");
      root.classList.add("is-entered");
      intro.classList.add("is-leaving");
      window.scrollTo(0, 0);
      setTimeout(() => intro.remove(), 900);
    });
  });
  // Se pausa al salir de la invitación (por ejemplo, al abrir el formulario) y vuelve al regresar
  let pausedByHide = false;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !music.paused) { pausedByHide = true; music.pause(); }
    else if (!document.hidden && pausedByHide) { pausedByHide = false; playMusic(); }
  });

  /* ---------- Silbato de árbitro (sintetizado, sin archivo) ---------- */
  let audioCtx;
  const whistle = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const ctx = audioCtx;
    const out = ctx.createGain();
    out.gain.value = 0.32;
    out.connect(ctx.destination);

    // Un "piiip": tono agudo con el trino de la bolita del silbato y un poco de aire
    const blow = (start, length) => {
      const t0 = ctx.currentTime + start;
      const t1 = t0 + length;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime(1, t0 + 0.02);
      env.gain.setValueAtTime(1, t1 - 0.05);
      env.gain.linearRampToValueAtTime(0, t1);
      env.connect(out);

      const tone = ctx.createOscillator();
      tone.type = "triangle";
      tone.frequency.setValueAtTime(2750, t0);
      tone.frequency.linearRampToValueAtTime(2900, t0 + 0.05);
      const trill = ctx.createOscillator(); // la bolita que vibra
      trill.frequency.value = 32;
      const trillDepth = ctx.createGain();
      trillDepth.gain.value = 170;
      trill.connect(trillDepth).connect(tone.frequency);
      const tremolo = ctx.createGain();
      tremolo.gain.value = 0.75;
      const tremDepth = ctx.createGain();
      tremDepth.gain.value = 0.25;
      trill.connect(tremDepth).connect(tremolo.gain);
      tone.connect(tremolo).connect(env);

      const second = ctx.createOscillator(); // armónico que le da el brillo metálico
      second.type = "sine";
      second.frequency.setValueAtTime(5600, t0);
      const secondGain = ctx.createGain();
      secondGain.gain.value = 0.12;
      second.connect(secondGain).connect(env);

      const noise = ctx.createBufferSource(); // soplido
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buf;
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 2900;
      band.Q.value = 3;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.18;
      noise.connect(band).connect(noiseGain).connect(env);

      [tone, trill, second, noise].forEach((n) => { n.start(t0); n.stop(t1 + 0.02); });
    };
    blow(0, 0.16);
    blow(0.26, 0.6);
  };

  /* ---------- Confirmar asistencia: suena el silbato y después abre el formulario ---------- */
  const rsvpBtn = document.getElementById("boton-confirmar");
  rsvpBtn.addEventListener("click", (event) => {
    whistle();
    const href = rsvpBtn.getAttribute("href");
    if (href === "#") return; // sin link personal: se muestra el aviso de abajo
    event.preventDefault();
    setTimeout(() => {
      const win = window.open(href, "_blank", "noreferrer");
      if (!win) location.href = href; // si el celular bloquea la pestaña nueva, abre en la misma
    }, 750);
  });

  /* ---------- Enlaces que todavía no tienen destino ---------- */
  document.querySelectorAll("[data-pending]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("href") !== "#") return;
      event.preventDefault();
      showToast(link.dataset.pending);
    });
  });

  /* ---------- Modal Cómo llegar ---------- */
  const modal = document.getElementById("locationModal");
  const stage = modal.querySelector(".img-modal__stage");
  const CARD = [9, 27.2, 91, 71.4]; // x1, y1, x2, y2 de la tarjeta en %
  const closeModal = () => (typeof modal.close === "function" ? modal.close() : modal.removeAttribute("open"));
  document.getElementById("openLocation").addEventListener("click", () => {
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  });
  modal.querySelector("[data-close]").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target.closest(".img-modal__hit")) return;
    const r = stage.getBoundingClientRect();
    const x = ((event.clientX - r.left) / r.width) * 100;
    const y = ((event.clientY - r.top) / r.height) * 100;
    if (x < CARD[0] || x > CARD[2] || y < CARD[1] || y > CARD[3]) closeModal();
  });
})();
