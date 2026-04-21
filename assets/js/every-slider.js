/**
 * Custom carousel — infinite loop (seamless): triple clone strip + snap on edges.
 * No Swiper/Slick.
 */
(function () {
  var root = document.querySelector("[data-every-slider]");
  if (!root) return;

  var track = root.querySelector(".swiper-wrapper");
  if (!track) return;

  var originals = Array.prototype.slice.call(
    track.querySelectorAll(".swiper-slide.card-every")
  );
  var nOrig = originals.length;
  if (nOrig < 1) return;

  function stripAos(el) {
    el.removeAttribute("data-aos");
    el.removeAttribute("data-aos-duration");
    el.removeAttribute("data-aos-delay");
  }

  function buildInfiniteStrip() {
    var fragPre = document.createDocumentFragment();
    var fragPost = document.createDocumentFragment();
    originals.forEach(function (node) {
      var a = node.cloneNode(true);
      var b = node.cloneNode(true);
      stripAos(a);
      stripAos(b);
      fragPre.appendChild(a);
      fragPost.appendChild(b);
    });
    track.insertBefore(fragPre, track.firstChild);
    track.appendChild(fragPost);
  }

  buildInfiniteStrip();

  var slides = Array.prototype.slice.call(
    track.querySelectorAll(".swiper-slide.card-every")
  );
  var total = slides.length;
  if (total !== nOrig * 3) return;

  var prevBtn = root.querySelector(".swiper-button-prev");
  var nextBtn = root.querySelector(".swiper-button-next");

  var startLogical = Math.min(
    Math.max(0, parseInt(root.getAttribute("data-start-index") || "3", 10) || 0),
    nOrig - 1
  );

  /** Center index in middle copy: nOrig .. 2*nOrig-1 */
  var physicalIndex = nOrig + startLogical;

  var touchStartX = 0;
  var locked = false;
  var autoplayTimer = null;

  var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  var SLIDE_TRANSITION =
    "transform 0.5s " +
    EASE +
    ", box-shadow 0.5s " +
    EASE +
    ", background 0.45s ease, border-color 0.45s ease, opacity 0.45s ease";

  function motionDurationMs() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 60 : 560;
  }

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function styleForDistance(d) {
    if (isMobile()) {
      var base =
        "transform-origin: center center; transition: " +
        SLIDE_TRANSITION +
        ";";
      var inactiveShadow = "box-shadow: 0 4px 14px rgba(40, 36, 109, 0.1);";
      if (d === 0) {
        return (
          base +
          "transform: translateY(0) scale(1); opacity: 1;" +
          "box-shadow: 0 16px 32px rgba(40, 36, 109, 0.25);" +
          "background: linear-gradient(180deg, #5a54bf 0%, #2c2973 100%);" +
          "border-color: #5b54c8;"
        );
      }
      return (
        base +
        "transform: translateY(0) scale(0.94); opacity: 0.65;" +
        inactiveShadow
      );
    }

    var ad = Math.max(-3, Math.min(3, d));
    var base =
      "transform-origin: center bottom; transition: " + SLIDE_TRANSITION + ";";
    var shadow = "box-shadow: 0 8px 20px rgba(40, 36, 109, 0.16);";
    var activeShadow = "box-shadow: 0 22px 42px rgba(40, 36, 109, 0.32);";

    if (ad === -3) return base + "transform: translateY(28px) rotate(-6deg);" + shadow;
    if (ad === -2) return base + "transform: translateY(8px) rotate(-4.5deg);" + shadow;
    if (ad === -1) return base + "transform: translateY(-5px) rotate(-2.5deg);" + shadow;
    if (ad === 1) return base + "transform: translateY(-9px) rotate(2.5deg);" + shadow;
    if (ad === 2) return base + "transform: translateY(2px) rotate(3.5deg);" + shadow;
    if (ad === 3) return base + "transform: translateY(16px) rotate(4deg);" + shadow;
    return (
      base +
      "transform: translateY(-8px) rotate(0deg) scale(1.03);" +
      activeShadow +
      "background: linear-gradient(180deg, #5a54bf 0%, #2c2973 100%);" +
      "border-color: #5b54c8;"
    );
  }

  function getGap() {
    var g = window.getComputedStyle(track).gap || window.getComputedStyle(track).columnGap;
    var x = parseFloat(g);
    return Number.isFinite(x) ? x : 10;
  }

  function applySlideStyles() {
    slides.forEach(function (el, i) {
      var d = i - physicalIndex;
      el.setAttribute("style", styleForDistance(d));

      var h3 = el.querySelector("h3");
      var p = el.querySelector("p");
      var a = el.querySelector("a");

      if (d === 0) {
        if (h3) h3.setAttribute("style", "color: #fff; transition: color 0.45s ease;");
        if (p) p.setAttribute("style", "color: #fff; transition: color 0.45s ease;");
        if (a) {
          a.setAttribute(
            "style",
            "background: linear-gradient(112deg, #70c7ae 0%, #4ea58e 100%); color: #fff; transition: background 0.45s ease, color 0.45s ease;"
          );
        }
      } else {
        if (h3) h3.removeAttribute("style");
        if (p) p.removeAttribute("style");
        if (a) a.removeAttribute("style");
      }
    });
  }

  function update(opts) {
    opts = opts || {};
    var instant = opts.instant === true;

    if (instant) {
      track.classList.add("every-slider--instant");
    }

    var slideW = slides[physicalIndex].offsetWidth;
    var gap = getGap();
    var step = slideW + gap;
    var vw = root.clientWidth;
    var offset = vw / 2 - (physicalIndex * step + slideW / 2);

    track.style.transform = "translate3d(" + offset + "px, 0, 0)";
    applySlideStyles();

    if (instant) {
      void track.offsetHeight;
      requestAnimationFrame(function () {
        track.classList.remove("every-slider--instant");
      });
    }
  }

  function snapIfOutOfMiddleBand() {
    var changed = false;
    if (physicalIndex >= 2 * nOrig) {
      physicalIndex -= nOrig;
      changed = true;
    } else if (physicalIndex < nOrig) {
      physicalIndex += nOrig;
      changed = true;
    }
    if (changed) {
      update({ instant: true });
    }
  }

  track.addEventListener("transitionend", function (e) {
    if (e.target !== track) return;
    if (e.propertyName !== "transform") return;
    snapIfOutOfMiddleBand();
  });

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (nOrig < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var baseMs = parseInt(root.getAttribute("data-autoplay") || "4500", 10);
    if (!Number.isFinite(baseMs) || baseMs <= 0) return;

    var delayMs = Math.max(baseMs, motionDurationMs() + 250);

    autoplayTimer = setInterval(function () {
      if (!locked) go(1);
    }, delayMs);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function go(delta) {
    if (locked) return;
    locked = true;
    physicalIndex += delta;
    update();
    setTimeout(function () {
      locked = false;
    }, motionDurationMs());
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      go(-1);
      restartAutoplay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      go(1);
      restartAutoplay();
    });
  }

  root.setAttribute("tabindex", "0");
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
      restartAutoplay();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
      restartAutoplay();
    }
  });

  root.addEventListener(
    "touchstart",
    function (e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  root.addEventListener(
    "touchend",
    function (e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) < 40) return;
      if (dx > 0) {
        go(-1);
      } else {
        go(1);
      }
      restartAutoplay();
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  var resizeScheduled = false;
  window.addEventListener("resize", function () {
    if (resizeScheduled) return;
    resizeScheduled = true;
    requestAnimationFrame(function () {
      resizeScheduled = false;
      update({ instant: true });
      restartAutoplay();
    });
  });

  function run() {
    requestAnimationFrame(function () {
      update({ instant: true });
      if (typeof AOS !== "undefined" && AOS.refresh) {
        AOS.refresh();
      }
      startAutoplay();
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run).catch(run);
  } else {
    run();
  }
})();
