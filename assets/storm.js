/* Ønskestormen: maleriet, lyn, sne, vindstød, røg, blinkende lys og dybde.
   Alt bliver stille, hvis brugeren har slået animationer fra. */
(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = innerWidth < 600;

  /* ---------- himmel-lag (bruges, hvis der ikke er et maleri) ---------- */
  const sky = document.createElement("div");
  sky.className = "sky";
  sky.setAttribute("aria-hidden", "true");
  sky.innerHTML = '<div class="stars"></div><div class="clouds"></div><div class="clouds two"></div><div class="flash"></div>' +
    '<svg class="bolt" viewBox="0 0 1000 600" preserveAspectRatio="none"><polyline points=""/><polyline points=""/></svg>';
  hero.prepend(sky);

  /* ---------- maleriet med levende detaljer ----------
     Punkterne er placeret i procent af maleriets egen størrelse (1672 × 941). */
  const IMG_W = 1672, IMG_H = 941, FOCUS_Y = 0.4;
  const P = {
    smoke: [[5.3, 16.5], [22.2, 38.5], [33.2, 53.5], [43.5, 55], [83, 49], [98, 15.5]],
    windows: [[13.5, 37.5], [10.8, 49.2], [16.2, 51], [16.2, 74.5], [11.6, 75.5], [28.5, 56], [30.5, 74], [37.5, 59], [40.8, 79], [96.8, 44.6], [96.6, 81], [88.6, 64], [85.5, 64.8], [73.6, 69], [52.5, 79.5], [56.8, 79]],
    lamps: [[8.4, 66.8], [87.6, 77], [29.6, 75], [43.6, 74.5]],
    star: [68.5, 48.8],
    garland: [[21, 57, 45, 74], [45, 74, 60, 70], [61, 68, 90, 52], [90, 52, 100, 46]]
  };
  const scene = document.createElement("div");
  scene.className = "scene";
  scene.setAttribute("aria-hidden", "true");
  const dot = (cls, [x, y], extra = "") => `<i class="${cls}" style="left:${x}%;top:${y}%;${extra}"></i>`;
  const rnd = (a, b) => a + Math.random() * (b - a);
  let html = '<div class="paint"></div><div class="glow-bolt"></div>';
  html += P.windows.map(p => dot("win", p, `animation-delay:-${rnd(0, 6).toFixed(1)}s;animation-duration:${rnd(3, 7).toFixed(1)}s`)).join("");
  html += P.lamps.map(p => dot("lamp", p, `animation-delay:-${rnd(0, 4).toFixed(1)}s`)).join("");
  for (const [x1, y1, x2, y2] of P.garland) {
    const n = small ? 4 : 8;
    for (let k = 1; k < n; k++) {
      const t = k / n, sag = Math.sin(t * Math.PI) * 2.2;
      html += dot("bulb", [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + sag], `animation-delay:-${rnd(0, 2.4).toFixed(2)}s`);
    }
  }
  html += dot("star", P.star);
  html += P.smoke.map(p => [0, 1, 2].map(k => dot("smoke", p, `animation-delay:-${(k * 2.2 + rnd(0, .8)).toFixed(1)}s`)).join("")).join("");
  scene.innerHTML = html;

  const pic = new Image();
  pic.onload = () => {
    hero.classList.add("has-banner");
    scene.querySelector(".paint").style.backgroundImage = `url("${pic.src}")`;
    sky.before(scene);
    fit();
  };
  pic.src = new URL("assets/banner.jpg", location.href).href;

  /* maleriet fylder heroen som "cover", lidt større så det kan bevæge sig */
  const ZOOM = 1.08;
  function fit() {
    const W = hero.clientWidth, H = hero.clientHeight;
    const s = Math.max(W / IMG_W, H / IMG_H) * ZOOM;
    const w = IMG_W * s, h = IMG_H * s;
    scene.style.width = w + "px"; scene.style.height = h + "px";
    scene.style.left = (W - w) / 2 + "px"; scene.style.top = (H - h) * FOCUS_Y + "px";
  }
  addEventListener("resize", fit);

  /* ---------- titlen: bogstaver der svæver ind + gnister ---------- */
  const h1 = hero.querySelector("h1");
  if (h1 && !still) {
    const txt = h1.textContent;
    h1.setAttribute("aria-label", txt);
    h1.innerHTML = [...txt].map((c, i) => `<span class="l" aria-hidden="true" style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join("") +
      '<span class="spark" aria-hidden="true" style="left:-4%;top:-10%">✦</span><span class="spark" aria-hidden="true" style="right:-3%;top:-18%">✦</span><span class="spark" aria-hidden="true" style="right:12%;bottom:-22%">✧</span>';
  }
  if (still) { window.Storm = { strike() {} }; return; }

  /* ---------- dybde: maleriet følger scroll, mus og telefonens hældning ---------- */
  let tx = 0, ty = 0, sy = 0, cx = 0, cy = 0;
  addEventListener("scroll", () => { sy = Math.min(scrollY, hero.offsetHeight); }, { passive: true });
  addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    tx = (e.clientX / innerWidth - .5) * -18; ty = (e.clientY / innerHeight - .5) * -10;
  }, { passive: true });
  addEventListener("deviceorientation", e => {
    if (e.gamma == null) return;
    tx = Math.max(-1, Math.min(1, e.gamma / 30)) * -16;
    ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)) * -10;
  });

  /* ---------- sne med vindstød ---------- */
  const cv = document.createElement("canvas");
  cv.className = "snow";
  cv.setAttribute("aria-hidden", "true");
  document.body.append(cv);
  const ctx = cv.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, flakes = [], t = 0, gust = 0, gustTarget = 0;
  function size() {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(small ? 70 : 160, W * H / 9000));
    flakes = Array.from({ length: n }, () => make(true));
  }
  function make(anywhere) {
    const z = Math.random();
    return { x: Math.random() * (W + 400) - 200, y: anywhere ? Math.random() * H : -10, z,
      r: .8 + z * 2.4, v: .5 + z * 1.6, a: .3 + z * .55, w: Math.random() * 6.28 };
  }
  function scheduleGust() {
    setTimeout(() => {
      gustTarget = -(5 + Math.random() * 6) * (Math.random() < .8 ? 1 : -1);
      hero.classList.add("gust");
      setTimeout(() => { gustTarget = 0; hero.classList.remove("gust"); }, 1400 + Math.random() * 900);
      scheduleGust();
    }, 7000 + Math.random() * 9000);
  }
  function tick() {
    t += .006;
    gust += (gustTarget - gust) * .04;
    const wind = Math.sin(t) * 1.2 - .8 + Math.sin(t * 3.7) * .4 + gust;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f4f8ff";
    for (const f of flakes) {
      f.w += .02 + Math.abs(gust) * .01;
      f.x += wind * (.4 + f.z) + Math.sin(f.w) * (.35 + Math.abs(gust) * .15);
      f.y += f.v * (1 - Math.min(.5, Math.abs(gust) * .05));
      ctx.globalAlpha = f.a;
      ctx.beginPath(); ctx.arc(f.x + tx * f.z * .6, f.y, f.r, 0, 6.283); ctx.fill();
      if (f.y > H + 10 || f.x < -220 || f.x > W + 220) Object.assign(f, make(false));
    }
    ctx.globalAlpha = 1;
    /* blød bevægelse af maleriet (dybde) */
    cx += (tx - cx) * .05; cy += (ty - cy) * .05;
    scene.style.transform = `translate3d(${cx.toFixed(2)}px,${(cy + sy * .22).toFixed(2)}px,0)`;
    requestAnimationFrame(tick);
  }

  /* ---------- lyn ---------- */
  const lines = sky.querySelectorAll("polyline");
  function path(x, y, len, spread) {
    const pts = [[x, y]];
    while (y < len) { y += 22 + Math.random() * 40; x += (Math.random() - .5) * spread; pts.push([x, y]); }
    return pts;
  }
  function strike(big) {
    const painted = hero.classList.contains("has-banner") && Math.random() < .55;
    if (painted || big) {
      /* det malede lyn tænder */
      hero.classList.remove("zap"); void hero.offsetWidth; hero.classList.add("zap");
    }
    if (!painted || big) {
      const x = 120 + Math.random() * 760;
      const main = path(x, 0, 300 + Math.random() * 90, 90);
      const fork = main[Math.floor(main.length / 2)];
      lines[0].setAttribute("points", main.map(p => p.join(",")).join(" "));
      lines[1].setAttribute("points", path(fork[0], fork[1], fork[1] + 110, 70).map(p => p.join(",")).join(" "));
      hero.style.setProperty("--fx", (x / 10) + "%");
      hero.classList.remove("strike"); void hero.offsetWidth; hero.classList.add("strike");
    }
  }
  function loop() { strike(false); setTimeout(loop, 6000 + Math.random() * 9000); }
  window.Storm = { strike: () => strike(true) };

  addEventListener("resize", size);
  size(); tick(); scheduleGust(); setTimeout(loop, 2200);
})();
