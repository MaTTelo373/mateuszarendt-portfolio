// =========================================================
// MATEUSZ ARENDT — PORTFOLIO
// Scroll reveal, nav state, mobile menu
// =========================================================

(function () {
  "use strict";

  /* ---- Reveal on scroll ------------------------------------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    window.__revealObserver = io; // exposed so dynamically-injected items (gallery) can register too
    revealEls.forEach(function (el, i) {
      // stagger items that share a row via data-reveal-group
      var group = el.getAttribute("data-reveal-group");
      if (group) {
        var idx = Array.prototype.indexOf.call(
          document.querySelectorAll('[data-reveal-group="' + group + '"]'),
          el
        );
        el.style.setProperty("--d", idx * 0.1 + "s");
      }
      io.observe(el);
    });
  } else {
    // no IO support: just show everything
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Video auto play/pause on visibility (battery + data friendly) --- */
  if ("IntersectionObserver" in window) {
    window.__videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var v = entry.target;
          if (entry.isIntersecting) {
            var p = v.play();
            if (p && p.catch) p.catch(function () {}); // ignore autoplay block
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.4 }
    );
  }

  /* ---- Animated stat counters — number ticks up on first view ---------- */
  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;
    if (prefersReduced) { el.textContent = target + suffix; return; }

    var dur = 1100;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      // ease-out cubic — fast then settle
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---- Nav background state on scroll ------------------------------ */
  var nav = document.querySelector(".site-nav");
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile menu toggle ------------------------------------------ */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---- Hero headline split + subtle parallax on hero media --------- */
  var heroMedia = document.querySelector(".hero-media");
  if (heroMedia) {
    var raf = null;
    var onHeroScroll = function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          heroMedia.style.transform = "translateY(" + y * 0.18 + "px)";
        }
        raf = null;
      });
    };
    window.addEventListener("scroll", onHeroScroll, { passive: true });
  }

  /* =====================================================================
     AUTO GALLERY — reads assets/images/<category>/manifest.txt and builds
     the gallery grid automatically. To add photos: drop files in the
     folder and add their filenames (one per line) to manifest.txt.
     ===================================================================== */
  var galleryEl = document.querySelector(".gallery[data-auto-gallery]");
  if (galleryEl) {
    var category = galleryEl.getAttribute("data-auto-gallery");
    var categoryNames = {
      automotive: "Motoryzacja",
      people: "Ludzie",
      travel: "Podróże",
      sports: "Sport",
      brand: "Marka"
    };
    var categoryPL = categoryNames[category] || category;
    var manifestUrl = "assets/images/" + category + "/manifest.txt";

    // Repeating width pattern so the grid stays visually varied
    // regardless of how many photos are listed.
    var widthPattern = ["w7", "w5", "w4", "w4", "w4", "w6", "w6", "w12"];

    fetch(manifestUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("manifest not found");
        return res.text();
      })
      .then(function (text) {
        var files = text
          .split("\n")
          .map(function (line) { return line.trim(); })
          .filter(function (line) { return line.length > 0 && line.charAt(0) !== "#"; });

        galleryEl.innerHTML = "";

        if (!files.length) {
          var empty = document.createElement("div");
          empty.className = "gallery-empty";
          empty.innerHTML =
            "<strong>Brak zdjęć w tej kategorii</strong>" +
            "Wgraj pliki do folderu <code>assets/images/" + category + "/</code> " +
            "i dopisz ich nazwy do pliku <code>manifest.txt</code> w tym samym folderze.";
          galleryEl.appendChild(empty);
          return;
        }

        var videoExt = /\.(mp4|webm|mov|m4v)$/i;

        files.forEach(function (filename, i) {
          var w = widthPattern[i % widthPattern.length];
          var item = document.createElement("div");
          item.className = "g-item " + w;
          item.setAttribute("data-reveal", "scale");
          item.setAttribute("data-reveal-group", "gallery");
          // stagger: each item enters slightly after the previous (cap so
          // later rows don't feel slow). 60ms cadence, max ~480ms.
          item.style.setProperty("--d", Math.min(i, 8) * 0.06 + "s");

          var src = "assets/images/" + category + "/" + filename;
          var isVideo = videoExt.test(filename);
          item.setAttribute("data-full", src);
          item.setAttribute("data-type", isVideo ? "video" : "image");

          if (isVideo) {
            var video = document.createElement("video");
            video.src = src;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.setAttribute("playsinline", "");
            video.preload = "metadata";
            item.appendChild(video);

            // play only while visible — saves battery/data, feels intentional
            video.addEventListener("mouseenter", function () { video.play(); });
            video.addEventListener("mouseleave", function () { video.pause(); });
            if (window.__videoObserver) window.__videoObserver.observe(video);

            var badge = document.createElement("span");
            badge.className = "video-badge";
            badge.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
            item.appendChild(badge);
          } else {
            var img = document.createElement("img");
            img.src = src;
            img.alt = categoryPL + " — Mateusz Arendt";
            img.loading = "lazy";
            item.appendChild(img);
          }

          galleryEl.appendChild(item);

          // re-observe for scroll reveal since these are injected after
          // the initial IntersectionObserver setup ran
          if (window.__revealObserver) {
            window.__revealObserver.observe(item);
          } else {
            item.classList.add("is-visible");
          }
        });

        initLightbox(galleryEl, categoryPL);
      })
      .catch(function () {
        // manifest missing or empty — leave the placeholder state as-is
      });
  }

  /* =====================================================================
     LIGHTBOX — fullscreen photo viewer for the gallery
     Opens on tile click, navigates with arrows / keyboard, closes on
     ESC / backdrop / button. Built per Emil's principles: ease-out enter,
     scale-from-0.96 (never from nothing), exit faster than enter.
     ===================================================================== */
  function initLightbox(gallery, label) {
    var tiles = Array.prototype.slice.call(gallery.querySelectorAll(".g-item[data-full]"));
    if (!tiles.length) return;

    var items = tiles.map(function (t) {
      return { src: t.getAttribute("data-full"), type: t.getAttribute("data-type") };
    });

    // Build lightbox DOM once
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Podgląd zdjęć: " + label);
    lb.innerHTML =
      '<button class="lb-btn lb-close" aria-label="Zamknij (Esc)">' +
        '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-btn lb-prev" aria-label="Poprzednie">' +
        '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="lb-btn lb-next" aria-label="Następne">' +
        '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<div class="lightbox-stage">' +
        '<span class="lightbox-counter"></span>' +
      '</div>';
    document.body.appendChild(lb);

    var stage = lb.querySelector(".lightbox-stage");
    var counter = lb.querySelector(".lightbox-counter");
    var btnClose = lb.querySelector(".lb-close");
    var btnPrev = lb.querySelector(".lb-prev");
    var btnNext = lb.querySelector(".lb-next");
    var current = 0;
    var mediaEl = null;
    var lastFocused = null;

    function render() {
      if (mediaEl) mediaEl.remove();
      var it = items[current];
      if (it.type === "video") {
        mediaEl = document.createElement("video");
        mediaEl.src = it.src;
        mediaEl.controls = true;
        mediaEl.autoplay = true;
        mediaEl.loop = true;
        mediaEl.playsInline = true;
      } else {
        mediaEl = document.createElement("img");
        mediaEl.src = it.src;
        mediaEl.alt = label + " — Mateusz Arendt";
      }
      mediaEl.className = "lightbox-media";
      stage.appendChild(mediaEl);
      counter.textContent = (current + 1) + " / " + items.length;
    }

    function open(i) {
      current = i;
      lastFocused = document.activeElement;
      render();
      // show single-item nav state
      var multi = items.length > 1;
      btnPrev.style.display = multi ? "" : "none";
      btnNext.style.display = multi ? "" : "none";
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      btnClose.focus();
      document.addEventListener("keydown", onKey);
    }

    function close() {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (mediaEl && mediaEl.tagName === "VIDEO") mediaEl.pause();
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function go(dir) {
      current = (current + dir + items.length) % items.length;
      render();
    }

    function onKey(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        // simple focus trap among the three buttons
        e.preventDefault();
      }
    }

    tiles.forEach(function (tile, i) {
      tile.addEventListener("click", function () { open(i); });
      // keyboard access: make tiles focusable + Enter/Space to open
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("role", "button");
      tile.setAttribute("aria-label", "Powiększ zdjęcie " + (i + 1));
      tile.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { go(-1); });
    btnNext.addEventListener("click", function () { go(1); });
    lb.addEventListener("click", function (e) {
      // click on backdrop (not on media or buttons) closes
      if (e.target === lb || e.target === stage) close();
    });
  }
})();
