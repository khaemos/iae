const body = document.body;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelectorAll(".nav a");
const canvas = document.querySelector("[data-field-canvas]");
const ctx = canvas.getContext("2d");

navToggle.addEventListener("click", () => {
  body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-label", body.classList.contains("nav-open") ? "Close navigation" : "Open navigation");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => body.classList.remove("nav-open"));
});

const particles = Array.from({ length: 58 }, (_, index) => ({
  phase: index * 0.38,
  radius: 0.12 + (index % 9) * 0.018,
  speed: 0.002 + (index % 5) * 0.00035,
}));

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(canvas.offsetWidth * ratio);
  canvas.height = Math.floor(canvas.offsetHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawField(time) {
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(30, 125, 122, 0.22)");
  gradient.addColorStop(0.5, "rgba(198, 152, 53, 0.12)");
  gradient.addColorStop(1, "rgba(185, 76, 40, 0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.lineWidth = 1;
  for (let i = 0; i < 18; i += 1) {
    const y = (height / 18) * i + Math.sin(time * 0.0006 + i) * 14;
    ctx.beginPath();
    for (let x = -20; x <= width + 20; x += 20) {
      const wave = Math.sin(x * 0.008 + i * 0.7 + time * 0.0008) * 22;
      if (x === -20) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.strokeStyle = i % 3 === 0 ? "rgba(185, 76, 40, 0.16)" : "rgba(16, 63, 66, 0.12)";
    ctx.stroke();
  }

  particles.forEach((particle) => {
    const orbit = time * particle.speed + particle.phase;
    const x = width * (0.5 + Math.cos(orbit) * particle.radius * 2.9);
    const y = height * (0.48 + Math.sin(orbit * 1.7) * particle.radius * 1.5);
    ctx.beginPath();
    ctx.arc(x, y, 2.1, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(17, 19, 21, 0.3)";
    ctx.fill();
  });

  requestAnimationFrame(drawField);
}

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", setHeaderState, { passive: true });
resizeCanvas();
setHeaderState();
requestAnimationFrame(drawField);
