// public/js/main.js
// ─────────────────────────────────────────────
// Client-side JavaScript for ShopEase
// ─────────────────────────────────────────────

// ── Mobile Nav Toggle ──────────────────────────
function toggleMenu() {
  const navLinks = document.querySelector(".nav-links");
  navLinks.classList.toggle("open");
}

// ── Auto-dismiss Flash Messages ────────────────
// Flash messages disappear after 4 seconds automatically
document.addEventListener("DOMContentLoaded", () => {
  const flash = document.querySelector(".flash");
  if (flash) {
    setTimeout(() => {
      flash.style.transition = "opacity 0.5s";
      flash.style.opacity = "0";
      setTimeout(() => flash.remove(), 500);
    }, 4000);
  }
});

// ── Confirm before destructive actions ─────────
// Delete buttons with class "confirm-action" ask before submitting
document.querySelectorAll(".confirm-action").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (!confirm("Are you sure? This cannot be undone.")) {
      e.preventDefault();
    }
  });
});

// ── Image preview before upload ────────────────
const imageInput = document.getElementById("image");
if (imageInput) {
  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Show preview if a preview element exists
        let preview = document.getElementById("image-preview");
        if (!preview) {
          preview = document.createElement("img");
          preview.id = "image-preview";
          preview.style.cssText = "width:120px;height:120px;object-fit:cover;border-radius:8px;margin-top:0.5rem;display:block;";
          imageInput.parentNode.appendChild(preview);
        }
        preview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}