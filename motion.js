(function () {
  "use strict";

  var reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var root = document.documentElement;
  var body = document.body;
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("#site-nav");
  var hero = document.querySelector(".hero");
  var heroMedia = document.querySelector(".hero-media");
  var historyTrack = document.querySelector(".history-track");
  var pinCtaLine = document.querySelector(".pin-cta-line");
  var pinCtaTrack = document.querySelector(".pin-cta-track");

  var supportsTimeline = false;
  try {
    supportsTimeline =
      typeof CSS !== "undefined" &&
      CSS.supports &&
      (CSS.supports("animation-timeline: view()") ||
        CSS.supports("animation-timeline", "view()"));
  } catch (err) {
    supportsTimeline = false;
  }

  root.classList.toggle("has-scroll-timeline", supportsTimeline);
  root.classList.toggle("no-scroll-timeline", !supportsTimeline);

  function closeNav() {
    if (!header || !toggle) return;
    header.classList.remove("is-nav-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openNav() {
    header.classList.add("is-nav-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  if (toggle && nav && header) {
    toggle.addEventListener("click", function () {
      if (header.classList.contains("is-nav-open")) closeNav();
      else openNav();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 640px)").matches) closeNav();
    });
  }

  function observeReveals() {
    var nodes = document.querySelectorAll("[data-observe]");
    if (!nodes.length || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    nodes.forEach(function (node) {
      io.observe(node);
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function progressThrough(el) {
    if (!el) return 0;
    var rect = el.getBoundingClientRect();
    var span = rect.height + window.innerHeight;
    if (span <= 0) return 0;
    return clamp((window.innerHeight - rect.top) / span, 0, 1);
  }

  var ticking = false;

  function updateFallbackMotion() {
    ticking = false;
    if (reduceMq.matches) return;

    if (!supportsTimeline && hero && heroMedia) {
      var heroRect = hero.getBoundingClientRect();
      var heroSpan = hero.offsetHeight || 1;
      var p = clamp(-heroRect.top / (heroSpan * 0.9), 0, 1);
      heroMedia.style.transform =
        "translate3d(0, " + p * 12 + "%, 0) scale(" + (1.08 - p * 0.08) + ")";
    }

    if (historyTrack) {
      historyTrack.style.setProperty("--pin-p", progressThrough(historyTrack).toFixed(3));
    }

    if (!supportsTimeline && pinCtaLine && pinCtaTrack) {
      var cta = progressThrough(pinCtaTrack);
      var scale = 0.96 + cta * 0.04;
      var opacity = 0.55 + cta * 0.45;
      pinCtaLine.style.transform = "scale(" + scale.toFixed(3) + ")";
      pinCtaLine.style.opacity = opacity.toFixed(3);
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateFallbackMotion);
  }

  function enableMotion() {
    observeReveals();
    updateFallbackMotion();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function disableFlourish() {
    root.classList.add("reduce-motion");
    document.querySelectorAll("[data-observe]").forEach(function (node) {
      node.classList.add("is-in");
    });
    if (heroMedia) heroMedia.style.transform = "";
    if (pinCtaLine) {
      pinCtaLine.style.transform = "";
      pinCtaLine.style.opacity = "";
    }
    if (historyTrack) historyTrack.style.setProperty("--pin-p", "1");
  }

  if (reduceMq.matches) {
    disableFlourish();
  } else {
    enableMotion();
  }

  if (typeof reduceMq.addEventListener === "function") {
    reduceMq.addEventListener("change", function (event) {
      if (event.matches) disableFlourish();
      else enableMotion();
    });
  }
})();
