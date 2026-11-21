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

  async function load() {
    const r = await fetch("data/onsker.json", { cache: "no-store" });
    if (!r.ok) throw new Error("Kunne ikke hente ønskerne");
    return r.json();
  }

  function card(i, claimHtml = "", buttons = "", taken = false) {
    const [tn, tv] = tier(i.price);
    const url = safeUrl(i.url);
    const meta = [i.shop && "Butik: " + i.shop, i.size && "Str. " + i.size, i.color && "Farve: " + i.color].filter(Boolean);
    return `<article class="card${taken ? " taken" : ""}" style="--rc:var(${tv})">
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
    const sorted = items.slice().sort((a, b) => (b.prio || 0) - (a.prio || 0));
    const shown = tab === "alle" ? CATS : CATS.filter(c => c[0] === tab);
    return shown.map(([k, l]) => {
      const g = sorted.filter(i => (i.cat || "dimser") === k);
      if (!g.length) return "";
      return `<section><h2>${esc(l)} <small>${g.length} ønsker</small></h2><div class="grid">${g.map(cardFn).join("")}</div></section>`;
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

  return { load, card, sections, tabs, legend, esc, sheet };
})();
