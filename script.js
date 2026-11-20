(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- Aviso ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  };

  /* ---------- Nombres de invitados ----------
     Los completa assets/invitation-personalization.js a partir de ?invite=<token>.
     Acá solo se achica la letra cuando los nombres son largos. */
  const guestEl = document.getElementById("nombres-invitados");
  const fitGuestNames = () => {
    const len = guestEl.textContent.trim().length;
    guestEl.classList.toggle("is-long", len > 12 && len <= 22);
    guestEl.classList.toggle("is-very-long", len > 22);
  };
  new MutationObserver(fitGuestNames).observe(guestEl, { childList: true, characterData: true, subtree: true });

  /* ---------- Cuenta regresiva: sábado 23 de enero de 2027, 21:00 (Argentina) ---------- */
  const target = new Date("2027-01-23T21:00:00-03:00").getTime();
  const cd = ["cdDays", "cdHours", "cdMinutes", "cdSeconds"].map((id) => document.getElementById(id));
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
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

  /* ---------- Lucecitas doradas que suben en la portada ---------- */
  if (!reducedMotion) {
    const bokeh = document.querySelector(".bokeh");
    const colors = ["rgba(255, 220, 150, 0.9)", "rgba(255, 236, 190, 0.9)", "rgba(120, 160, 255, 0.85)"];
    for (let i = 0; i < 16; i++) {
      const dot = document.createElement("i");
      const t = rand(9, 16);
      dot.style.cssText = `--x:${rand(0, 96)}%;--size:${rand(1.2, 3.6)}cqw;--c:${colors[i % 3]};--t:${t}s;--d:${-rand(0, t)}s;--dx:${rand(-8, 8)}cqw;--o:${rand(0.45, 0.9).toFixed(2)}`;
      bokeh.append(dot);
    }

    /* Reflejos de bola de disco que barren la pantalla de invitados */
    const glints = document.querySelector(".glints");
    const glintColors = ["rgba(255, 245, 220, 0.95)", "rgba(150, 185, 255, 0.95)", "rgba(255, 215, 140, 0.95)"];
    for (let i = 0; i < 22; i++) {
      const g = document.createElement("i");
      const t = rand(7, 12);
      g.style.cssText = `--y:${rand(2, 98)}%;--size:${rand(0.8, 2)}cqw;--c:${glintColors[i % 3]};--t:${t}s;--d:${-rand(0, t)}s;--r:${rand(-20, 20)}deg;--o:${rand(0.35, 0.8).toFixed(2)}`;
      glints.append(g);
    }
  }

  /* ---------- Fotos dentro de las polaroid ----------
     Deforma cada recuadro para que sus 4 esquinas caigan sobre las de la ventana
     de la foto en el diseño (perspectiva), y lo recalcula si cambia el tamaño. */
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
  const keepStage = document.querySelector(".panel--keep .stage");
  const placePols = () => {
    const scale = keepStage.clientWidth / 941;
    if (!scale) return;
    pols.forEach((pol) => {
      const quad = pol.dataset.quad.split(" ").map((pt) => pt.split(",").map((n) => Number(n) * scale));
      pol.style.transform = quadMatrix(pol.offsetWidth, pol.offsetHeight, quad);
      pol.classList.add("is-placed");
    });
  };
  placePols();
  if ("ResizeObserver" in window) new ResizeObserver(placePols).observe(keepStage);
  else addEventListener("resize", placePols);

  /* ---------- Aparición de textos ---------- */
  if (!reducedMotion && "IntersectionObserver" in window) {
    root.classList.add("js-reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-revealed");
        io.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // Cada sección se "enciende" cuando entra en pantalla
    const lightIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-lit");
        lightIo.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    document.querySelectorAll(".panel").forEach((el) => {
      if (el.classList.contains("panel--cover")) el.classList.add("is-lit");
      else lightIo.observe(el);
    });
  }

  /* ---------- Polvo dorado flotando sobre toda la invitación ----------
     Una sola capa fija: acompaña al invitado mientras baja y une las secciones. */
  if (!reducedMotion) {
    const canvas = document.createElement("canvas");
    canvas.className = "dust";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = 1, motes = [], lastScroll = window.scrollY, drift = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(60, (W * H) / 9000));
      motes = Array.from({ length: count }, () => ({
        x: rand(0, W), y: rand(0, H), r: rand(0.6, 2.1), vy: rand(-0.25, -0.06), vx: rand(-0.12, 0.12),
        a: rand(0.25, 0.85), tw: rand(0, Math.PI * 2), ts: rand(0.01, 0.035), depth: rand(0.3, 1),
        hue: Math.random() < 0.8 ? [255, 222, 160] : [170, 195, 255],
      }));
    };
    resize();
    addEventListener("resize", resize);
    // Al deslizar, las partículas se mueven un poco más (efecto profundidad)
    addEventListener("scroll", () => { drift += (window.scrollY - lastScroll) * 0.25; lastScroll = window.scrollY; }, { passive: true });
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      drift *= 0.9;
      for (const m of motes) {
        m.x += m.vx; m.y += m.vy - drift * 0.02 * m.depth; m.tw += m.ts;
        if (m.y < -10) { m.y = H + 10; m.x = rand(0, W); }
        if (m.y > H + 10) { m.y = -10; m.x = rand(0, W); }
        if (m.x < -10) m.x = W + 10; else if (m.x > W + 10) m.x = -10;
        const alpha = m.a * (0.55 + 0.45 * Math.sin(m.tw));
        const [r, g, b] = m.hue;
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 3.2);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(0.3, `rgba(${r},${g},${b},${alpha * 0.8})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 3.2, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    /* Chispas doradas donde el invitado toca */
    const sparkColors = ["#ffe6a8", "#f2c869", "#ffffff", "#9fb8ff"];
    addEventListener("pointerdown", (e) => {
      for (let i = 0; i < 12; i++) {
        const s = document.createElement("i");
        const ang = (i / 12) * Math.PI * 2 + rand(-0.3, 0.3);
        const dist = rand(28, 62);
        s.className = "spark";
        s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--c:${sparkColors[i % 4]};--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist}px`;
        document.body.append(s);
        setTimeout(() => s.remove(), 900);
      }
    }, { passive: true });
  }

  /* ---------- Música de fondo ---------- */
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
  musicBtn.addEventListener("click", () => (music.paused ? playMusic() : music.pause()));

  // Se pausa al salir de la invitación (por ejemplo, al abrir el formulario) y vuelve al regresar
  let pausedByHide = false;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !music.paused) { pausedByHide = true; music.pause(); }
    else if (!document.hidden && pausedByHide) { pausedByHide = false; playMusic(); }
  });

  /* ---------- Intro: entrar con o sin música ---------- */
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

  /* ---------- Confirmar asistencia sin link personal ---------- */
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
  const CARD = [9, 28.9, 91, 79.5]; // tarjeta dentro del diseño, en %: x1, y1, x2, y2
  const openModal = () => (typeof modal.showModal === "function" ? modal.showModal() : modal.setAttribute("open", ""));
  const closeModal = () => (typeof modal.close === "function" ? modal.close() : modal.removeAttribute("open"));
  document.getElementById("openLocation").addEventListener("click", openModal);
  modal.querySelector("[data-close]").addEventListener("click", closeModal);
  // Tocar fuera de la tarjeta la cierra
  modal.addEventListener("click", (event) => {
    if (event.target.closest(".img-modal__hit")) return;
    const r = stage.getBoundingClientRect();
    const x = ((event.clientX - r.left) / r.width) * 100;
    const y = ((event.clientY - r.top) / r.height) * 100;
    if (x < CARD[0] || x > CARD[2] || y < CARD[1] || y > CARD[3]) closeModal();
  });
})();
