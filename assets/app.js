/* Fælles kode for begge sider: henter ønsker og tegner quest-kortene. */
window.Onske = (() => {
  const CATS = [["dimser", "Legetøj, dimser & dingenoter"], ["toj", "Tøj"], ["oplev", "Oplevelser & gavekort"]];
  const TIERS = [[1200, "Legendarisk", "--q4"], [700, "Episk", "--q3"], [400, "Sjælden", "--q2"], [200, "Ualmindelig", "--q1"], [0, "Almindelig", "--q0"]];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : "";
  const kr = n => Math.round(n).toLocaleString("da-DK") + " kr.";
  const hasPrice = p => p !== null && p !== undefined && p !== "";
  const tier = p => hasPrice(p) ? TIERS.find(t => +p >= t[0]).slice(1) : ["Mystisk", "--q5"];
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
      <div class="top"><span class="pill" style="color:var(${tv})">${tn}</span>${i.sure === false ? '<span class="pill maybe">Måske</span>' : ""}<span class="prio" title="Hvor gerne">${"★".repeat(+i.prio || 2)}</span></div>
      <h3>${esc(i.title)}</h3>
      <div class="price">${coin}${hasPrice(i.price) ? kr(+i.price) : "Valgfrit beløb"}${i.priceNote ? `<small>${esc(i.priceNote)}</small>` : ""}</div>
      <div class="bind">Bindes ved gave</div>
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
      return `<section><h2>${esc(l)} <small>${g.length} quests</small></h2><div class="grid">${g.map(cardFn).join("")}</div></section>`;
    }).join("");
  }

  function tabs(tab) {
    return [["alle", "Alle"], ...CATS].map(([k, l]) => `<button class="tab" data-tab="${k}" aria-pressed="${tab === k}">${esc(l)}</button>`).join("");
  }

  function legend() {
    return "Rarity efter pris: " + TIERS.slice().reverse().map(t => `<span class="pill" style="color:var(${t[2]})">${t[1]}${t[0] ? " " + t[0] + "+" : ""}</span>`).join("") +
      '<span class="pill" style="color:var(--q5)">Mystisk = valgfrit beløb</span>';
  }

  return { load, card, sections, tabs, legend, esc };
})();
