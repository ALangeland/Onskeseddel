/**
 * Backend til gæstesiden på Asbjørns ønskeseddel.
 * Gemmer reservationer i fanen "Reservationer" i det Google Sheet, scriptet hører til.
 *
 * Skift koden herunder, hvis du vil have en anden. Del den kun med gæsterne.
 */
const KODE = 'nisse2026';

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.code !== KODE) return svar({ ok: false, error: 'kode' });
  const key = String(p.key || '').slice(0, 64);
  const action = p.action || 'list';

  if (action === 'claim' || action === 'unclaim') {
    const id = String(p.id || '').slice(0, 64);
    if (!id || !key) return svar({ ok: false, error: 'mangler' });
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sh = ark();
      const rows = sh.getDataRange().getValues();
      // find eksisterende række for denne person og denne gave
      let found = -1;
      for (let r = 1; r < rows.length; r++) if (rows[r][1] === id && rows[r][3] === key) { found = r; break; }
      if (action === 'claim' && found < 0) {
        const name = String(p.name || 'Anonym').replace(/[\r\n]/g, ' ').slice(0, 40);
        sh.appendRow([new Date(), id, name, key]);
      }
      if (action === 'unclaim' && found >= 0) sh.deleteRow(found + 1);
    } finally {
      lock.releaseLock();
    }
  }
  return svar({ ok: true, claims: liste(key) });
}

function liste(key) {
  const rows = ark().getDataRange().getValues().slice(1);
  return rows.filter(r => r[1]).map(r => ({ id: String(r[1]), name: String(r[2]), mine: r[3] === key }));
}

function ark() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Reservationer');
  if (!sh) {
    sh = ss.insertSheet('Reservationer');
    sh.appendRow(['Tidspunkt', 'Gave-id', 'Navn', 'Nøgle (rør ikke)']);
  }
  return sh;
}

function svar(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
