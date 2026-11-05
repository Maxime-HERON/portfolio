/* =========================================================
   PORTFOLIO — Motion design
   GSAP + ScrollTrigger + Lenis (smooth scroll)
   ========================================================= */

(() => {
  "use strict";

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  // Petits utilitaires indépendants de GSAP
  $(".js-year").textContent = new Date().getFullYear();
  startClock();
  startTyped();

  // Si le CDN GSAP n'a pas chargé : on affiche le site sans animations
  if (!window.gsap || !window.ScrollTrigger) {
    document.body.classList.remove("is-loading");
    $(".preloader")?.remove();
    $(".about__photo").style.clipPath = "none";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // bloqué pendant le preloader
  }

  // Liens d'ancre -> scroll fluide
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(target, { duration: 1.6 }) : target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------------- Split du texte en lettres / mots ---------------- */
  function splitChars(el) {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.innerHTML = [...text]
      .map((c) => `<span class="char" aria-hidden="true">${c === " " ? "&nbsp;" : c}</span>`)
      .join("");
    return $$(".char", el);
  }
  function splitWords(el) {
    el.innerHTML = el.textContent
      .trim()
      .split(/\s+/)
      .map((w) => `<span class="word">${w}</span>`)
      .join(" ");
    return $$(".word", el);
  }

  $$("[data-split]").forEach(splitChars);

  // Dégradé continu sur un mot découpé : chaque lettre affiche sa portion
  const alignGradients = () =>
    $$(".outline").forEach((el) => {
      const width = el.offsetWidth;
      $$(".char", el).forEach((c) => {
        c.style.backgroundSize = `${width}px 100%`;
        c.style.backgroundPosition = `${el.offsetLeft - c.offsetLeft}px 0`;
      });
    });
  alignGradients();
  window.addEventListener("resize", alignGradients);
  document.fonts?.ready.then(alignGradients);
  $$("[data-reveal-title]").forEach((t) => {
    t.innerHTML = `<span class="line"><span class="line__inner">${t.textContent}</span></span>`;
    splitChars($(".line__inner", t));
  });

  if (reduceMotion) {
    finishLoading();
    return;
  }

  /* ---------------- Preloader ---------------- */
  const heroChars = $$(".hero__title .char");
  gsap.set(heroChars, { yPercent: 115 });
  gsap.set([".hero__meta", ".hero__bottom", ".nav"], { autoAlpha: 0 });

  const counter = { v: 0 };
  gsap.timeline()
    .to(counter, {
      v: 100, duration: 2, ease: "power2.inOut",
      onUpdate: () => ($(".js-count").textContent = Math.round(counter.v)),
    })
    .to(".preloader__bar span", { width: "100%", duration: 2, ease: "power2.inOut" }, 0)
    .to(".preloader__inner", { autoAlpha: 0, y: -30, duration: 0.5 })
    .to(".preloader", { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "-=0.1")
    .add(introHero, "-=0.5");

  function introHero() {
    gsap.timeline({ onComplete: finishLoading })
      .to(heroChars, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.04 })
      .to([".nav", ".hero__meta", ".hero__bottom"], { autoAlpha: 1, duration: 1, stagger: 0.12 }, "-=0.8");
  }

  function finishLoading() {
    document.body.classList.remove("is-loading");
    $(".preloader")?.remove();
    lenis?.start();
    ScrollTrigger.refresh();
  }

  /* ---------------- Hero : parallax de sortie ---------------- */
  gsap.to(".hero__title", {
    yPercent: 30, opacity: 0.2, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------------- Barre de progression globale ---------------- */
  gsap.to(".scroll-progress span", {
    scaleX: 1, ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });

  /* ---------------- Marquee (vitesse liée au scroll) ---------------- */
  const marquee = gsap.to(".marquee__track", { xPercent: -50, duration: 20, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate(self) {
      const v = self.getVelocity() / 300;
      gsap.to(marquee, { timeScale: gsap.utils.clamp(-6, 6, 1 + Math.abs(v)) * self.direction, duration: 0.3, overwrite: true });
      gsap.to(marquee, { timeScale: self.direction, duration: 1, delay: 0.3 });
    },
  });

  /* ---------------- Titres de section ---------------- */
  $$("[data-reveal-title]").forEach((title) => {
    gsap.from($$(".char", title), {
      yPercent: 110, rotate: 8, duration: 1, ease: "expo.out", stagger: 0.03,
      scrollTrigger: { trigger: title, start: "top 85%" },
    });
  });
  $$(".section__index").forEach((idx) => {
    gsap.from(idx, { autoAlpha: 0, x: -20, duration: 0.8, scrollTrigger: { trigger: idx, start: "top 85%" } });
  });

  /* ---------------- 01 — About ---------------- */
  gsap.to(".about__photo", {
    clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut",
    scrollTrigger: { trigger: ".about__visual", start: "top 75%" },
  });
  gsap.fromTo(".about__photo > *", { yPercent: -10 }, {
    yPercent: 0, ease: "none",
    scrollTrigger: { trigger: ".about__visual", start: "top bottom", end: "bottom top", scrub: true },
  });
  gsap.from(".about__frame", {
    x: -30, y: -30, autoAlpha: 0, duration: 1.4, ease: "expo.out", delay: 0.6,
    scrollTrigger: { trigger: ".about__visual", start: "top 75%" },
  });

  // Mots qui s'allument au fil du scroll
  $$("[data-scrub-text]").forEach((el) => {
    gsap.to(splitWords(el), {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  });

  $$("[data-fade]").forEach((el) => {
    gsap.from(el, { y: 40, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  $$("[data-counter]").forEach((el) => {
    const obj = { v: 0 };
    gsap.to(obj, {
      v: +el.dataset.counter, duration: 2, ease: "power2.out",
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
  });

  gsap.from(".about .btn", { y: 30, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: ".about .btn", start: "top 95%" } });

  /* ---------------- 02 — Skills ---------------- */
  gsap.from(".skill-card", {
    y: 80, rotateX: -25, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.08,
    scrollTrigger: { trigger: ".skills__grid", start: "top 80%" },
  });
  $$(".skill-card__bar").forEach((bar) => {
    gsap.to($("span", bar), {
      scaleX: +bar.dataset.level / 100, duration: 1.6, ease: "expo.out", delay: 0.4,
      scrollTrigger: { trigger: bar, start: "top 92%" },
    });
  });
  $$(".soft-item").forEach((item, i) => {
    gsap.from(item, {
      x: i % 2 ? 120 : -120, autoAlpha: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: item, start: "top 90%" },
    });
  });
  $$(".skills__subtitle").forEach((s) =>
    gsap.from(s, { autoAlpha: 0, y: 20, duration: 0.8, scrollTrigger: { trigger: s, start: "top 90%" } })
  );

  /* ---------------- 03 — Expérience : scroll horizontal ---------------- */
  const track = $(".experience__track");
  const cards = $$(".exp-card");
  $(".js-exp-total").textContent = String(cards.length).padStart(2, "0");

  const mm = gsap.matchMedia();
  mm.add("(min-width: 861px)", () => {
    const distance = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: ".experience__pin",
        start: "top top",
        end: () => "+=" + distance(),
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate(self) {
          gsap.set(".experience__progress-bar span", { scaleX: self.progress });
          const idx = Math.min(cards.length, Math.floor(self.progress * cards.length) + 1);
          $(".js-exp-current").textContent = String(idx).padStart(2, "0");
        },
      },
    });

    // Chaque carte se « redresse » en entrant dans l'écran
    cards.forEach((card) => {
      gsap.from(card, {
        rotateY: -15, scale: 0.9, autoAlpha: 0.3, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 100%", end: "left 60%", scrub: true },
      });
    });
  });
  mm.add("(max-width: 860px)", () => {
    cards.forEach((card) =>
      gsap.from(card, { y: 60, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 88%" } })
    );
  });

  /* ---------------- 04 — Contact ---------------- */
  const contactChars = $$(".contact__big .char");
  gsap.from(contactChars, {
    yPercent: 115, duration: 1.2, ease: "expo.out", stagger: 0.025,
    scrollTrigger: { trigger: ".contact__big", start: "top 80%" },
  });
  gsap.from([".contact__mail", ".contact__socials li"], {
    y: 40, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.1,
    scrollTrigger: { trigger: ".contact__grid", start: "top 85%" },
  });

  /* ---------------- Navigation active ---------------- */
  $$("[data-section]").forEach((sec) => {
    const link = $(`[data-nav="${sec.dataset.section}"]`);
    ScrollTrigger.create({
      trigger: sec, start: "top center", end: "bottom center",
      onToggle: (self) => link?.classList.toggle("is-active", self.isActive),
    });
  });

  /* ---------------- Interactions souris ---------------- */
  if (!isTouch) {
    initCursor();
    initMagnetic();
    initTilt();
  }
  initHeroCanvas();

  /* =========================================================
     FONCTIONS
     ========================================================= */

  function initCursor() {
    const dot = $(".cursor__dot"), ring = $(".cursor__ring");
    const xDot = gsap.quickTo(dot, "x", { duration: 0.1 }), yDot = gsap.quickTo(dot, "y", { duration: 0.1 });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" }), yRing = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    window.addEventListener("mousemove", (e) => { xDot(e.clientX); yDot(e.clientY); xRing(e.clientX); yRing(e.clientY); });
    $$("a, button, [data-tilt], .soft-item").forEach((el) => {
      el.addEventListener("mouseenter", () => $(".cursor").classList.add("is-hover"));
      el.addEventListener("mouseleave", () => $(".cursor").classList.remove("is-hover"));
    });
  }

  function initMagnetic() {
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  function initTilt() {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
        gsap.to(card, { rotateY: (px - 0.5) * 12, rotateX: (0.5 - py) * 12, duration: 0.5, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" }));
    });
  }

  // Grille de points en perspective qui ondule — réagit à la souris
  function initHeroCanvas() {
    const canvas = $(".hero__canvas");
    const ctx = canvas.getContext("2d");
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let w, h, dpr, visible = true;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => { mouse.tx = e.clientX / w; mouse.ty = e.clientY / h; });
    ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onToggle: (s) => (visible = s.isActive) });

    const COLS = 72, ROWS = 44, Z_MAX = 14;
    const draw = (time) => {
      if (!visible) return;
      const t = time * 0.8;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      ctx.clearRect(0, 0, w, h);

      const horizon = h * 0.45;
      const camX = (mouse.x - 0.5) * 6;              // la caméra suit la souris
      for (let r = 0; r < ROWS; r++) {
        const z = 1 + (r / ROWS) * (Z_MAX - 1);       // profondeur
        for (let c = 0; c < COLS; c++) {
          const xw = (c / (COLS - 1) - 0.5) * 60;     // position monde
          const wave = Math.sin(xw * 0.25 + t) + Math.cos(z * 0.8 - t * 1.4);
          // « bosse » lumineuse sous le curseur
          const sx = w / 2 + ((xw - camX) * w * 0.05) / z;
          const dx = (sx - mouse.x * w) / w;
          const bump = Math.exp(-(dx * dx) * 40) * Math.exp(-((z - 3) ** 2) / 6) * 3;
          const sy = horizon + (h * 0.6) / z - ((wave + bump) * h * 0.035) / z;
          if (sx < -5 || sx > w + 5 || sy > h + 5) continue;
          const a = Math.min(1, (1 - z / Z_MAX) * 1.2);
          ctx.fillStyle = bump > 0.5
            ? `rgba(198,255,61,${a})`
            : `rgba(150,130,255,${a * 0.5})`;
          const s = Math.max(0.8, 2.6 / z);
          ctx.fillRect(sx, sy, s, s);
        }
      }
    };
    gsap.ticker.add(draw);
  }

  function startClock() {
    const el = $(".js-clock");
    const tick = () => (el.textContent = new Date().toLocaleTimeString("fr-FR"));
    tick(); setInterval(tick, 1000);
  }

  function startTyped() {
    const el = $(".js-typed");
    const words = el.dataset.words.split(",");
    let wi = 0, ci = 0, deleting = false;
    const loop = () => {
      const word = words[wi];
      el.textContent = word.slice(0, ci);
      if (!deleting && ci === word.length) { deleting = true; return setTimeout(loop, 1600); }
      if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
      ci += deleting ? -1 : 1;
      setTimeout(loop, deleting ? 50 : 110);
    };
    loop();
  }
})();
