(function () {
  "use strict";

  /* ---------- Header scroll state + floating CTA + back to top ---------- */
  const header = document.getElementById("header");
  const floatingCta = document.getElementById("floatingCta");
  const toTop = document.getElementById("toTop");

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    floatingCta.classList.toggle("is-visible", y > 700);
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const navOverlay = document.getElementById("navOverlay");

  function closeMenu() { document.body.classList.remove("menu-open"); }
  burger.addEventListener("click", function () {
    document.body.classList.toggle("menu-open");
  });
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
  if (navOverlay) navOverlay.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Client stories: open via button (mobile) ---------- */
  const casesToggle = document.getElementById("casesToggle");
  const casesList = document.getElementById("casesList");
  if (casesToggle && casesList) {
    casesToggle.addEventListener("click", function () {
      const open = casesList.classList.toggle("is-open");
      casesToggle.setAttribute("aria-expanded", open ? "true" : "false");
      casesToggle.textContent = open ? "Скрыть истории" : "Показать истории";
      if (open) {
        casesList.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".stat-card__num");
  let countersDone = false;

  function animateCounters() {
    if (countersDone) return;
    countersDone = true;
    counters.forEach(function (el) {
      const target = parseInt(el.getAttribute("data-count"), 10) || 0;
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1600;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("ru-RU") + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  const statsWrap = document.querySelector(".stats-row");
  if (statsWrap && "IntersectionObserver" in window) {
    const statObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { animateCounters(); statObs.disconnect(); } });
      },
      { threshold: 0.4 }
    );
    statObs.observe(statsWrap);
  } else {
    animateCounters();
  }

  /* ---------- Team bio toggles ---------- */
  document.querySelectorAll(".member").forEach(function (member) {
    const toggle = member.querySelector(".member__toggle");
    toggle.addEventListener("click", function () {
      const open = member.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- Price tabs ---------- */
  const tabs = document.querySelectorAll(".price-tab");
  const panels = document.querySelectorAll(".price-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const key = tab.getAttribute("data-tab");
      tabs.forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === key);
      });
    });
  });

  /* ---------- FAQ: keep one open at a time ---------- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Lead form ---------- */
  const form = document.getElementById("leadForm");
  const success = document.getElementById("formSuccess");

  function formatPhone(value) {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (!digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(0, 11);
    let out = "+7";
    if (digits.length > 1) out += " (" + digits.slice(1, 4);
    if (digits.length >= 4) out += ") " + digits.slice(4, 7);
    if (digits.length >= 7) out += "-" + digits.slice(7, 9);
    if (digits.length >= 9) out += "-" + digits.slice(9, 11);
    return out;
  }

  const phoneInput = document.getElementById("phone");
  phoneInput.addEventListener("input", function () {
    phoneInput.value = formatPhone(phoneInput.value);
    phoneInput.classList.remove("invalid");
  });

  const nameInput = document.getElementById("name");
  nameInput.addEventListener("input", function () { nameInput.classList.remove("invalid"); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let ok = true;
    if (nameInput.value.trim().length < 2) { nameInput.classList.add("invalid"); ok = false; }
    if (phoneInput.value.replace(/\D/g, "").length < 11) { phoneInput.classList.add("invalid"); ok = false; }
    if (!ok) return;

    // Собираем данные заявки (готово к отправке на сервер / в CRM)
    var services = Array.prototype.map.call(
      form.querySelectorAll('input[name="service"]:checked'),
      function (i) { return i.value; }
    );
    var messengerEl = form.querySelector('input[name="messenger"]:checked');
    var lead = {
      name: nameInput.value.trim(),
      phone: phoneInput.value,
      services: services,
      messenger: messengerEl ? messengerEl.value : "Max"
    };
    // TODO: отправить lead на backend / в Telegram-бот / CRM
    void lead;

    success.classList.add("is-visible");
    form.querySelector("button[type=submit]").textContent = "Заявка отправлена";
    form.querySelector("button[type=submit]").disabled = true;
    setTimeout(function () {
      form.reset();
      success.classList.remove("is-visible");
      const btn = form.querySelector("button[type=submit]");
      btn.textContent = "Записаться на консультацию";
      btn.disabled = false;
    }, 5000);
  });

  /* ---------- Before / After sliders ---------- */
  document.querySelectorAll("[data-ba]").forEach(function (slider) {
    var before = slider.querySelector(".ba-before");
    var line = slider.querySelector(".ba-line");
    var range = slider.querySelector(".ba-range");
    if (!before || !line || !range) return;

    function setPos(val) {
      var v = Math.max(0, Math.min(100, val));
      before.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
      line.style.left = v + "%";
    }
    setPos(parseFloat(range.value) || 50);
    range.addEventListener("input", function () { setPos(parseFloat(range.value)); });

    // Drag anywhere on the slider (pointer) for nicer UX
    function posFromEvent(clientX) {
      var rect = slider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }
    var dragging = false;
    slider.addEventListener("pointerdown", function (e) {
      dragging = true;
      try { slider.setPointerCapture(e.pointerId); } catch (err) { void err; }
      var v = posFromEvent(e.clientX);
      range.value = v; setPos(v);
    });
    slider.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      e.preventDefault();
      var v = posFromEvent(e.clientX);
      range.value = v; setPos(v);
    });
    slider.addEventListener("pointerup", function () { dragging = false; });
    slider.addEventListener("pointercancel", function () { dragging = false; });
  });

  /* ---------- Current year in footer (if needed) ---------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
