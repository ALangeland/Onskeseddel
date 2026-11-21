/* Ønskestormen: tordenhimmel over byen og snefald over hele siden.
   Stille, hvis brugeren har slået animationer fra. */
(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sky = document.createElement("div");
  sky.className = "sky";
  sky.setAttribute("aria-hidden", "true");
  sky.innerHTML = '<div class="stars"></div><div class="clouds"></div><div class="clouds two"></div><div class="flash"></div>' +
    '<svg class="bolt" viewBox="0 0 1000 600" preserveAspectRatio="none"><polyline points=""/><polyline points=""/></svg>';
  hero.prepend(sky);
  const by = document.createElement("div");
  by.className = "by";
  by.setAttribute("aria-hidden", "true");
  sky.after(by);

  /* titlen: bogstaver der hopper ind + gnister */
  const h1 = hero.querySelector("h1");
  if (h1 && !still) {
    const txt = h1.textContent;
    h1.setAttribute("aria-label", txt);
    h1.innerHTML = [...txt].map((c, i) => `<span class="l" aria-hidden="true" style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join("") +
      '<span class="spark" aria-hidden="true" style="left:-4%;top:-10%">✦</span><span class="spark" aria-hidden="true" style="right:-3%;top:-18%">✦</span><span class="spark" aria-hidden="true" style="right:12%;bottom:-22%">✧</span>';
  }
  if (still) return;

  /* sne */
  const cv = document.createElement("canvas");
  cv.className = "snow";
  cv.setAttribute("aria-hidden", "true");
  document.body.append(cv);
  const ctx = cv.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, flakes = [], t = 0;
  function size() {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(W < 600 ? 70 : 160, W * H / 9000));
    flakes = Array.from({ length: n }, () => make(true));
  }
  function make(anywhere) {
    const z = Math.random(); // dybde: små og langsomme bagest
    return { x: Math.random() * (W + 300) - 150, y: anywhere ? Math.random() * H : -10, z,
      r: .8 + z * 2.4, v: .5 + z * 1.6, a: .25 + z * .5, w: Math.random() * 6.28 };
  }
  function tick() {
    t += .006;
    const wind = Math.sin(t) * 1.4 - 1 + Math.sin(t * 3.7) * .5; // vindstød
    ctx.clearRect(0, 0, W, H);
    for (const f of flakes) {
      f.w += .02;
      f.x += wind * (.4 + f.z) + Math.sin(f.w) * .35;
      f.y += f.v;
      ctx.globalAlpha = f.a;
      ctx.fillStyle = "#f4f8ff";
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
      if (f.y > H + 10 || f.x < -160 || f.x > W + 160) Object.assign(f, make(false));
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  /* lyn */
  const lines = sky.querySelectorAll("polyline");
  function path(x, y, len, spread) {
    const pts = [[x, y]];
    while (y < len) { y += 22 + Math.random() * 40; x += (Math.random() - .5) * spread; pts.push([x, y]); }
    return pts;
  }
  function lightning() {
    const x = 120 + Math.random() * 760;
    const main = path(x, 0, 330 + Math.random() * 90, 90);
    const fork = main[Math.floor(main.length / 2)];
    lines[0].setAttribute("points", main.map(p => p.join(",")).join(" "));
    lines[1].setAttribute("points", path(fork[0], fork[1], fork[1] + 120, 70).map(p => p.join(",")).join(" "));
    hero.style.setProperty("--fx", (x / 10) + "%");
    hero.classList.remove("strike"); void hero.offsetWidth; hero.classList.add("strike");
    setTimeout(lightning, 6000 + Math.random() * 10000);
  }
  addEventListener("resize", size);
  size(); tick(); setTimeout(lightning, 2200);
})();
