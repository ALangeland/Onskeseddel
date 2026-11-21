# Asbjørns ønskeseddel 2026

To sider på GitHub Pages:

- **`index.html`** – selve ønskesedlen. Den er til Asbjørn og alle andre, og den viser ingen reservationer.
- **`gaest.html`** – gæstesiden, låst med en kode. Her kan gæsterne sætte sig på gaver. **Asbjørn åbner den ikke.**

Ønskerne ligger i `data/onsker.json`. Reservationerne ligger i et Google Sheet, som kun gæstesiden snakker med.

> Koden er en lås, så man ikke åbner siden ved et uheld. Den er ikke bygget til at stoppe nogen, der virkelig vil kigge.

## Ret i ønskerne

Åbn `data/onsker.json` på GitHub og tryk på blyanten. Hvert ønske ser sådan ud:

```json
{"id":"batteri","cat":"dimser","title":"…","price":550,"priceNote":"ca.","shop":"Proshop",
 "url":"https://…","size":"","color":"","sure":true,"prio":3,"desc":"…"}
```

- `cat`: `dimser`, `toj` eller `oplev`
- `price`: tal i kroner, eller `null` for valgfrit beløb
- `sure`: `false` viser et "Måske"-mærke
- `prio`: 1–3 stjerner
- `id`: skal være unikt. **Skift det ikke på et ønske, som nogen allerede har taget**, for så forsvinder reservationen.

Husk kommaer mellem ønskerne. Tryk "Commit changes", så er siden opdateret efter et minut.

## Engangsopsætning af Google Sheet (ca. 5 min.)

Gør det her én gang, og **åbn aldrig arket bagefter**. Det er der, reservationerne står.

1. Gå til <https://sheets.new> og kald arket fx "Ønskeseddel – IKKE ÅBNE".
2. Vælg **Udvidelser → Apps Script**.
3. Slet det, der står i editoren, og indsæt hele indholdet af `apps-script/Kode.gs`. Vil du have en anden kode end `nisse2026`, så ret den øverst i scriptet. Gem.
4. Tryk **Implementer → Ny implementering**. Vælg typen **Webapp** ved tandhjulet.
   - Udfør som: **Mig**
   - Hvem har adgang: **Alle**
5. Tryk **Implementer** og godkend adgangen. Google advarer om en "ikke-bekræftet app". Det er dit eget script, så vælg **Avanceret → Gå til …**.
6. Kopier **webapp-URL'en**, som slutter på `/exec`.
7. Åbn `assets/config.js` på GitHub, indsæt URL'en mellem anførselstegnene og commit:
   ```js
   window.ONSKE_API = "https://script.google.com/macros/s/…/exec";
   ```

Send koden og linket til gæstesiden til gæsterne, så er det klar.

Retter du senere i scriptet, skal du vælge **Implementer → Administrer implementeringer → rediger → Ny version**, så URL'en forbliver den samme.

## Egne billeder

Upload dine egne fotos til mappen `assets/` med præcis disse navne. Siden bruger dem automatisk, og et billede, der ikke findes, bliver bare ikke vist.

- `banner.jpg` – stort baggrundsbillede bag titlen, fx din motorcykel. Gerne liggende, ca. 1600 px bredt.
- `foto1.jpg`, `foto2.jpg`, `foto3.jpg` – tre små stående billeder i hjørnet, fx printeren, cyklen og et screenshot af din karakter.

Upload på GitHub med **Add file → Upload files** inde i mappen `assets`.
