/* Fælles kode for begge sider: henter ønsker og tegner quest-kortene. */
window.Onske = (() => {
  const CATS = [["dimser", "Legetøj, dimser & dingenoter"], ["toj", "Tøj"], ["oplev", "Oplevelser & gavekort"]];
  const TIERS = [[1200, "Over 1.200 kr.", "--q4"], [700, "700–1.200 kr.", "--q3"], [400, "400–700 kr.", "--q2"], [200, "200–400 kr.", "--q1"], [0, "Under 200 kr.", "--q0"]];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : "";
  const kr = n => Math.round(n).toLocaleString("da-DK") + " kr.";
  const hasPrice = p => p !== null && p !== undefined && p !== "";
  const tier = p => hasPrice(p) ? TIERS.find(t => +p >= t[0]).slice(1) : ["Vælg selv beløb", "--q5"];
  const coin = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8" fill="#e8c35a"/><circle cx="9" cy="9" r="5.5" fill="none" stroke="#a5812a" stroke-width="1.5"/></svg>';


  /* små håndtegnede ikoner, når der ikke er et billede (egne tegninger) */
  const S = 'stroke="#5a4536" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
  const ICONS = {
    batteri: `<rect x="34" y="22" width="52" height="38" rx="6" fill="#2f7f8c" ${S}/><rect x="40" y="14" width="40" height="12" rx="3" fill="#3b3b44" ${S}/><rect x="44" y="34" width="32" height="8" rx="2" fill="#e8eef0" ${S}/><circle cx="48" cy="52" r="2.5" fill="#7dd87a"/><circle cx="56" cy="52" r="2.5" fill="#7dd87a"/><circle cx="64" cy="52" r="2.5" fill="#7dd87a"/><circle cx="72" cy="52" r="2.5" fill="#cfd8dc"/>`,
    pumpe: `<rect x="30" y="30" width="54" height="30" rx="8" fill="#2f7f8c" ${S}/><rect x="40" y="36" width="20" height="12" rx="2" fill="#1d2b30" ${S}/><text x="50" y="45.5" font-size="8" fill="#7dffcf" text-anchor="middle" font-family="monospace">2.4</text><path d="M84 44c14 0 14 18 4 18" fill="none" ${S}/><path d="M38 30v-8h22v8" fill="#3b3b44" ${S}/>`,
    kuffert: `<rect x="26" y="28" width="68" height="36" rx="5" fill="#2f7f8c" ${S}/><rect x="26" y="28" width="68" height="10" rx="4" fill="#3b4b55" ${S}/><rect x="50" y="18" width="20" height="10" rx="3" fill="none" ${S}/><rect x="34" y="44" width="8" height="10" rx="2" fill="#d9a22a" ${S}/><rect x="78" y="44" width="8" height="10" rx="2" fill="#d9a22a" ${S}/>`,
    sortiment: `<rect x="24" y="22" width="72" height="42" rx="5" fill="#cfe7ef" fill-opacity=".8" ${S}/><path d="M48 22v42M72 22v42M24 43h72" ${S} fill="none"/><circle cx="36" cy="32" r="3" fill="#d9a22a"/><circle cx="60" cy="54" r="3" fill="#c8423a"/><circle cx="84" cy="32" r="3" fill="#7a8a95"/><path d="M33 52l6 4M80 50l6 4" ${S}/>`,
    pskive: `<rect x="34" y="18" width="52" height="46" rx="6" fill="#2b5aa8" ${S}/><circle cx="60" cy="42" r="15" fill="#fffdf8" ${S}/><path d="M60 42v-9M60 42l6 4" ${S}/><text x="60" y="30" font-size="9" fill="#fff" text-anchor="middle" font-family="sans-serif" font-weight="700">P</text>`,
    pc: `<rect x="40" y="12" width="40" height="58" rx="4" fill="#2a2a30" ${S}/><rect x="44" y="16" width="14" height="50" rx="2" fill="#b07a46" ${S}/><path d="M47 22h8M47 28h8M47 34h8M47 40h8M47 46h8" stroke="#7a5230" stroke-width="1.5"/><rect x="61" y="16" width="15" height="50" rx="2" fill="#6fb2d8" fill-opacity=".45" ${S}/><circle cx="68" cy="30" r="5" fill="none" stroke="#9fe3ff" stroke-width="1.5"/><circle cx="68" cy="50" r="5" fill="none" stroke="#9fe3ff" stroke-width="1.5"/>`,
    filament: `<rect x="28" y="14" width="64" height="54" rx="6" fill="#e9eef2" ${S}/><rect x="34" y="20" width="52" height="40" rx="3" fill="#cfe7ef" fill-opacity=".7" ${S}/><circle cx="48" cy="40" r="10" fill="#c8423a" ${S}/><circle cx="48" cy="40" r="3" fill="#fffdf8"/><circle cx="72" cy="40" r="10" fill="#2f7f8c" ${S}/><circle cx="72" cy="40" r="3" fill="#fffdf8"/><text x="60" y="66" font-size="6" fill="#5a4536" text-anchor="middle" font-family="sans-serif">27%</text>`,
    mystisk: `<rect x="36" y="30" width="48" height="34" rx="3" fill="#c79a5a" ${S}/><path d="M36 30l8-12h32l8 12" fill="#d9b47a" ${S}/><text x="60" y="55" font-size="20" fill="#fffdf8" text-anchor="middle" font-family="sans-serif" font-weight="900" stroke="#5a4536" stroke-width="1">?</text>`,
    taske: `<path d="M34 34h52l-4 32H38z" fill="#2a2a30" ${S}/><path d="M46 34c0-14 28-14 28 0" fill="none" ${S} stroke-width="3"/><rect x="52" y="44" width="16" height="8" rx="2" fill="#5a5a66"/>`,
    boxer: `<path d="M32 24h56v12l-6 28H66l-6-14-6 14H38l-6-28z" fill="#3b3b44" ${S}/><rect x="32" y="24" width="56" height="8" fill="#5a5a66" ${S}/>`,
    skjorte: `<path d="M42 16l18 8 18-8 14 10-6 12-8-4v34H42V34l-8 4-6-12z" fill="#5d6a72" ${S}/><path d="M52 18l8 10 8-10M60 28v40" fill="none" ${S}/><circle cx="60" cy="38" r="1.5" fill="#fff"/><circle cx="60" cy="48" r="1.5" fill="#fff"/><circle cx="60" cy="58" r="1.5" fill="#fff"/>`,
    "trøje": `<path d="M42 18l18 6 18-6 16 12-8 12-6-4v32H40V38l-6 4-8-12z" fill="#34507f" ${S}/><path d="M52 20l8 8 8-8" fill="#fffdf8" ${S}/><path d="M40 66h40" ${S}/>`,
    gavekort: `<rect x="26" y="22" width="68" height="42" rx="6" fill="#c8423a" ${S}/><path d="M26 38h68M50 22v42" stroke="#f3d27a" stroke-width="5"/><path d="M50 38c-10-12-18-4-10 0M50 38c10-12 18-4 10 0" fill="none" stroke="#f3d27a" stroke-width="3"/>`,
    gave: `<rect x="34" y="30" width="52" height="34" rx="3" fill="#c8423a" ${S}/><rect x="30" y="24" width="60" height="10" rx="2" fill="#d65145" ${S}/><path d="M60 24v40" stroke="#f3d27a" stroke-width="6"/>`
  };
  function thumb(i) {
    const ic = ICONS[i.icon] || ICONS.gave;
    const svg = `<svg viewBox="0 0 120 80" aria-hidden="true">${ic}</svg>`;
    const src = safeUrl(i.img);
    if (!src) return `<div class="thumb">${svg}</div>`;
    return `<div class="thumb"><img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(this.nextElementSibling.content.cloneNode(true))"><template>${svg}</template></div>`;
  }

  async function load() {
    const r = await fetch("data/onsker.json", { cache: "no-store" });
    if (!r.ok) throw new Error("Kunne ikke hente ønskerne");
    return r.json();
  }

  function card(i, claimHtml = "", buttons = "", taken = false) {
    const [tn, tv] = tier(i.price);
    const url = safeUrl(i.url);
    const meta = [i.shop && "Butik: " + i.shop, i.size && "Str. " + i.size, i.color && "Farve: " + i.color].filter(Boolean);
    return `<article class="card${taken ? " taken" : ""}" data-id="${esc(i.id)}" style="--rc:var(${tv})">
      <i class="cap" aria-hidden="true"></i>
      ${thumb(i)}
      <div class="top"><span class="pill" style="color:var(${tv})">${tn}</span>${i.sure === false ? '<span class="pill maybe">Måske</span>' : ""}<span class="prio" title="Hvor gerne Asbjørn vil have den (1–3 stjerner)">${"★".repeat(+i.prio || 2)}</span></div>
      <h3>${esc(i.title)}</h3>
      <div class="price">${coin}${hasPrice(i.price) ? kr(+i.price) : "Beløb efter eget valg"}${i.priceNote ? `<small>${esc(i.priceNote)}</small>` : ""}</div>
      ${i.desc ? `<p class="desc">${esc(i.desc)}</p>` : ""}
      ${meta.length ? `<ul class="meta">${meta.map(m => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
      ${claimHtml}
      <div class="actions">${url ? `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">Se varen ↗</a>` : ""}${buttons}</div>
    </article>`;
  }

  function sections(items, tab, cardFn) {
    const pr = i => hasPrice(i.price) ? +i.price : Infinity;
    const sorted = items.slice().sort((a, b) => pr(a) - pr(b) || (b.prio || 0) - (a.prio || 0));
    const shown = tab === "alle" ? CATS : CATS.filter(c => c[0] === tab);
    return shown.map(([k, l]) => {
      const g = sorted.filter(i => (i.cat || "dimser") === k);
      if (!g.length) return "";
      return `<section><h2><span>${esc(l)}</span> <small>${g.length} ønsker</small></h2><div class="grid">${g.map(cardFn).join("")}</div></section>`;
    }).join("");
  }

  function tabs(tab) {
    return [["alle", "Alle"], ...CATS].map(([k, l]) => `<button class="tab" data-tab="${k}" aria-pressed="${tab === k}">${esc(l)}</button>`).join("");
  }

  function legend() {
    return "Farven viser prisen: " + TIERS.slice().reverse().map(t => `<span class="pill" style="color:var(${t[2]})">${t[1]}</span>`).join("") +
      '<span class="pill" style="color:var(--q5)">Vælg selv beløb</span>' + " · Stjernerne viser, hvor gerne Asbjørn vil have det.";
  }

  function sheet(items, extra = []) {
    const now = new Date(), y = now.getFullYear();
    const start = new Date(y, 0, 1), eve = new Date(y, 11, 24);
    const pct = Math.min(100, Math.max(0, (now - start) / (eve - start) * 100));
    const days = Math.max(0, Math.ceil((eve - now) / 864e5));
    const maybe = items.filter(i => i.sure === false).length;
    const stats = [["Ønsker på listen", items.length], ["Ikke helt sikker endnu", maybe], ...extra];
    const prof = [["3D-print", "300/300"], ["Motorcykel-mekanik", "285/300"], ["Makita-værktøj", "300/300"], ["Tålmodighed til jul", days ? "1/300" : "300/300"]];
    return `<div class="nm">Asbjørn</div><div class="cl">Ønskeseddel ${y} · Nørd-niveau: højt</div>
      <div class="xp" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="Hvor langt vi er mod juleaften"><i style="width:${pct.toFixed(1)}%"></i></div>
      <div class="xpl"><span>Nedtælling til juleaften</span><span>${days ? days + " dage tilbage" : "Det er jul!"}</span></div>
      <dl class="sk">${stats.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
      <h4>Færdigheder (point ud af 300)</h4><dl class="sk">${prof.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
  }

  /* mangarammer der popper ind, når man scroller */
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let io = null;
  const seen = new Set();
  const tabKey = () => (document.querySelector(".tab[aria-pressed=true]") || {}).dataset?.tab || "";
  if (!still && "IntersectionObserver" in window) {
    document.documentElement.classList.add("anim");
    io = new IntersectionObserver(es => {
      let n = 0;
      for (const e of es) if (e.isIntersecting) { e.target.style.setProperty("--d", n++); e.target.classList.add("in"); seen.add(e.target.dataset.id + tabKey()); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
  }
  function reveal(root = document) {
    for (const c of root.querySelectorAll(".card:not(.in)")) {
      if (!io || seen.has(c.dataset.id + tabKey())) c.classList.add("in", "seen"); else io.observe(c);
    }
  }

  /* lille fejring når en gave bliver taget */
  function boom(card) {
    if (!card || still) return;
    if (window.Storm) window.Storm.strike();
    const words = ["Sådan!", "Juhuu!", "Top!", "Yes!"];
    const b = document.createElement("div"); b.className = "boom"; b.textContent = words[Math.floor(Math.random() * words.length)];
    card.append(b);
    const cols = ["#ffd66b", "#ff3d6e", "#8fd3ff", "#7dffa6", "#fff"];
    for (let i = 0; i < 16; i++) {
      const s = document.createElement("span"); s.className = "bit"; s.textContent = i % 3 ? "✦" : "❄";
      const ang = Math.random() * 6.283, dist = 70 + Math.random() * 90;
      s.style.cssText = `--x:${Math.cos(ang) * dist}px;--y:${Math.sin(ang) * dist}px;--c:${cols[i % cols.length]}`;
      card.append(s);
    }
    setTimeout(() => card.querySelectorAll(".boom,.bit").forEach(e => e.remove()), 1000);
  }

  return { load, card, sections, tabs, legend, esc, sheet, reveal, boom };
})();
