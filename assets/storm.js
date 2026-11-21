/* Ønskestormen: slud og lyn i baggrunden. Stille, hvis brugeren har slået animationer fra. */
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layer = document.createElement("div");
  layer.className = "storm";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = '<div class="clouds"></div><svg class="bolt" viewBox="0 0 1000 600" preserveAspectRatio="none"><polyline points=""/></svg><canvas></canvas><div class="flash"></div>';
  document.body.prepend(layer);
  if (still) return;

  const cv = layer.querySelector("canvas"), ctx = cv.getContext("2d");
  let W = 0, H = 0, drops = [];
  const dpr = Math.min(devicePixelRatio || 1, 2);
  function size() {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(220, W * H / 7000));
    drops = Array.from({ length: n }, () => make(true));
  }
  function make(anywhere) {
    const snow = Math.random() < 0.35; // slud = regn + våd sne
    return { x: Math.random() * (W + 200) - 100, y: anywhere ? Math.random() * H : -20, snow,
      v: snow ? 1.6 + Math.random() * 1.6 : 9 + Math.random() * 7, l: 10 + Math.random() * 14, r: 1 + Math.random() * 1.8, w: Math.random() * 6.28 };
  }
  let wind = -2.2;
  function tick() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    for (const d of drops) {
      if (d.snow) {
        d.w += 0.03; d.x += wind * 0.5 + Math.sin(d.w) * 0.6; d.y += d.v;
        ctx.fillStyle = "rgba(225,235,245,.55)"; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.28); ctx.fill();
      } else {
        d.x += wind; d.y += d.v;
        ctx.strokeStyle = "rgba(170,190,215,.32)"; ctx.lineWidth = 1.1; ctx.beginPath();
        ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - wind * d.l / d.v * 1.6, d.y - d.l); ctx.stroke();
      }
      if (d.y > H + 20 || d.x < -120) Object.assign(d, make(false));
    }
    requestAnimationFrame(tick);
  }

  const flash = layer.querySelector(".flash"), bolt = layer.querySelector(".bolt"), line = bolt.querySelector("polyline");
  function lightning() {
    let x = 150 + Math.random() * 700, y = 0;
    const pts = [[x, y]];
    while (y < 420) { y += 30 + Math.random() * 50; x += (Math.random() - 0.5) * 110; pts.push([x, y]); }
    line.setAttribute("points", pts.map(p => p.join(",")).join(" "));
    layer.classList.remove("strike"); void layer.offsetWidth; layer.classList.add("strike");
    setTimeout(lightning, 5000 + Math.random() * 9000);
  }
  addEventListener("resize", size);
  size(); tick(); setTimeout(lightning, 1800);
})();
