(function () {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const loader = $("#loader");
  const nav = $("#nav");
  const ham = $("#ham");
  const mob = $("#mob");
  const accent = $("#accentCycle");
  const form = $("#cForm");
  const canvas = $("#pcanvas");

  document.body.classList.add("loading");

  function hideLoader() {
    if (!loader) return;
    loader.classList.add("is-hidden");
    document.body.classList.remove("loading");
  }

  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, 450);
  });
  window.setTimeout(hideLoader, 1600);

  function setNavState() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }

  setNavState();
  window.addEventListener("scroll", setNavState, { passive: true });

  if (ham && mob) {
    ham.addEventListener("click", () => {
      const isOpen = mob.classList.toggle("is-open");
      ham.classList.toggle("is-active", isOpen);
      ham.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });

    $$("a", mob).forEach((link) => {
      link.addEventListener("click", () => {
        mob.classList.remove("is-open");
        ham.classList.remove("is-active");
        ham.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });
  }

  if (accent) {
    const words = ["en grande", "con emoción", "con tradición", "para recordar"];
    let i = 0;
    window.setInterval(() => {
      i = (i + 1) % words.length;
      accent.style.opacity = "0";
      accent.style.transform = "translateY(8px)";
      window.setTimeout(() => {
        accent.textContent = words[i];
        accent.style.opacity = "1";
        accent.style.transform = "translateY(0)";
      }, 180);
    }, 2450);
  }

  const revealTargets = $$(".rev");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach((target) => observer.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  function setupCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const notes = [];
    const glyphs = ["♪", "♫", "♬"];
    let width = 0;
    let height = 0;
    let running = true;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth || window.innerWidth;
      height = canvas.offsetHeight || window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      notes.length = 0;
      const total = Math.max(14, Math.floor(width / 90));
      for (let n = 0; n < total; n += 1) {
        notes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          s: 15 + Math.random() * 24,
          v: .18 + Math.random() * .42,
          a: .1 + Math.random() * .24,
          g: glyphs[Math.floor(Math.random() * glyphs.length)]
        });
      }
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      ctx.font = "700 22px Cinzel, Georgia, serif";
      ctx.textBaseline = "middle";
      notes.forEach((note) => {
        note.y -= note.v;
        note.x += Math.sin((note.y + note.s) * .01) * .22;
        if (note.y < -40) {
          note.y = height + 40;
          note.x = Math.random() * width;
        }
        ctx.save();
        ctx.globalAlpha = note.a;
        ctx.fillStyle = "#fff0b8";
        ctx.font = `700 ${note.s}px Cinzel, Georgia, serif`;
        ctx.fillText(note.g, note.x, note.y);
        ctx.restore();
      });
      window.requestAnimationFrame(draw);
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      running = false;
      return;
    }

    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });
  }

  setupCanvas();

  function buildMessage(formData) {
    const get = (key) => (formData.get(key) || "").toString().trim();
    return [
      "Hola, Mariachi Voz de México. Quiero solicitar disponibilidad para una presentación.",
      `Nombre: ${get("nombre")}`,
      get("empresa") ? `Empresa: ${get("empresa")}` : "",
      get("telefono") ? `Teléfono: ${get("telefono")}` : "",
      get("email") ? `Correo: ${get("email")}` : "",
      `Lugar del evento: ${get("lugar")}`,
      `Tipo de evento: ${get("evento")}`,
      `Fecha: ${get("fecha")}`,
      get("horario") ? `Horario deseado: ${get("horario")}` : "",
      `Momento musical: ${get("momento")}`,
      `Servicio de interés: ${get("tipo")}`,
      get("mensaje") ? `Comentarios: ${get("mensaje")}` : ""
    ].filter(Boolean).join("\n");
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const required = $$("[required]", form);
      let valid = true;

      required.forEach((field) => {
        const ok = Boolean(field.value.trim());
        field.classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        const firstInvalid = $(".is-invalid", form);
        firstInvalid?.focus();
        return;
      }

      const message = buildMessage(new FormData(form));
      const whatsappNumber = form.dataset.whatsappNumber || "525541767153";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      const button = $(".btn-submit", form);
      const originalHtml = button ? button.innerHTML : "";

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(message);
        }
      } catch (error) {
        console.warn("No se pudo copiar el mensaje automáticamente.", error);
      }

      if (button) {
        button.textContent = "Mensaje listo para enviar";
        window.setTimeout(() => {
          button.innerHTML = originalHtml;
        }, 2600);
      }

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });

    $$(".fi", form).forEach((field) => {
      field.addEventListener("input", () => field.classList.remove("is-invalid"));
      field.addEventListener("change", () => field.classList.remove("is-invalid"));
    });
  }
})();
