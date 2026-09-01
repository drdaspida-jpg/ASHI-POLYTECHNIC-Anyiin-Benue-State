// ===== SHARED SITE-WIDE BEHAVIOR (runs on every page) =====

document.addEventListener("DOMContentLoaded", function () {
  // Auto-update footer year
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Add a subtle shadow to the header once the user scrolls
  var header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 10) {
        header.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
      } else {
        header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
      }
    });
  }

  // Smooth scroll for on-page anchor links (e.g. #contact)
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId.length > 1) {
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  // Simple fade-in animation for elements with class "fade-in"
  var faders = document.querySelectorAll(".fade-in");
  if ("IntersectionObserver" in window && faders.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    faders.forEach(function (el) { observer.observe(el); });
  }

  // Rotate the homepage hero and keep manual controls in sync.
  var heroSlides = document.querySelectorAll(".hero-slide");
  var heroDotsContainer = document.querySelector(".hero-dots");
  var heroPrev = document.getElementById("heroPrev");
  var heroNext = document.getElementById("heroNext");
  if (heroSlides.length && heroDotsContainer) {
    heroSlides.forEach(function (slide, slideIndex) {
      var dot = document.createElement("button");
      var slideLabel = slide.getAttribute("aria-label") || "image " + (slideIndex + 1);
      dot.className = "hero-dot";
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Show " + slideLabel);
      dot.setAttribute("aria-selected", "false");
      heroDotsContainer.appendChild(dot);
    });

    var heroDots = heroDotsContainer.querySelectorAll(".hero-dot");
    var heroIndex = Array.from(heroSlides).findIndex(function (slide) {
      return slide.classList.contains("active");
    });
    if (heroIndex < 0) heroIndex = 0;
    var showHero = function (index) {
      heroIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === heroIndex);
      });
      heroDots.forEach(function (dot, dotIndex) {
        var isActive = dotIndex === heroIndex;
        dot.classList.toggle("active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    };
    showHero(heroIndex);
    var nextHero = function () { showHero(heroIndex + 1); };
    var heroTimer = window.setInterval(nextHero, 3000);
    heroDots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showHero(dotIndex);
        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(nextHero, 3000);
      });
    });
    [heroPrev, heroNext].forEach(function (button, buttonIndex) {
      if (button) {
        button.addEventListener("click", function () {
          showHero(heroIndex + (buttonIndex ? 1 : -1));
          window.clearInterval(heroTimer);
          heroTimer = window.setInterval(nextHero, 3000);
        });
      }
    });
  }
});