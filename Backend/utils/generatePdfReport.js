// Backend/utils/generatePdfReport.js
const puppeteer = require("puppeteer");

/**
 * Build and return a PDF Buffer for invalid Excel rows and for padded IDs.
 * @param {Object} params
 * @param {string} params.sourceFileName
 * @param {Array}  params.errors - [{ rowNumber, id, name, email, reasons: [] }]
 * @param {Array}  params.paddedWarnings - [{ rowNumber, paddedId, originalId, name, email, note }]
 * @param {number} params.addedCount
 * @param {number} params.totalCount
 */
async function generatePdfReport({
  sourceFileName,
  errors,
  paddedWarnings,
  addedCount,
  totalCount,
}) {
  const now = new Date().toLocaleString("he-IL", { hour12: false });

  const errorRowsHtml = (errors || [])
    .map(
      (e) => `
    <tr>
      <td>${e.rowNumber}</td>
      <td>${e.id ?? ""}</td>
      <td>${e.name ?? ""}</td>
      <td>${e.email ?? ""}</td>
      <td>${
        Array.isArray(e.reasons)
          ? e.reasons.join(", ")
          : String(e.reasons || "")
      }</td>
    </tr>
  `
    )
    .join("");

  const paddedRowsHtml = (paddedWarnings || [])
    .map(
      (e) => `
    <tr>
      <td>${e.rowNumber}</td>
      <td>${e.paddedId ?? ""}</td>
      <td>${e.originalId ?? ""}</td>
      <td>${e.name ?? ""}</td>
      <td>${e.email ?? ""}</td>
      <td>${e.note ?? ""}</td>
    </tr>
  `
    )
    .join("");

  const html = `
  <html lang="he" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <style>
        body { direction: rtl; font-family: Arial, sans-serif; padding: 24px; }
        h1 { margin: 0 0 12px 0; font-size: 20px; }
        h2 { margin: 24px 0 8px 0; font-size: 16px; }
        .meta { color: #444; margin-bottom: 16px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 8px; }
        th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; word-wrap: break-word; }
        th { background: #f2f2f2; }
        .small { font-size: 11px; color: #666; }
      </style>
    </head>
    <body>
      <h1>דו"ח קליטת Excel</h1>
      <div class="meta">
        תאריך יצירה: ${now}<br/>
        קובץ מקור: ${sourceFileName}<br/>
        סיכום: נוספו ${addedCount} מתוך ${totalCount}. נמצאו ${
    errors.length
  } שורות בעייתיות. בוצעה השלמת 0 מוביל ל־${paddedWarnings.length} נבחנים.
      </div>

      <h2>טבלת שגיאות (רשומות שלא נוספו)</h2>
      <table>
        <thead>
          <tr>
            <th>מספר שורה</th>
            <th>ת"ז</th>
            <th>שם מלא</th>
            <th>אימייל</th>
            <th>סיבת כישלון</th>
          </tr>
        </thead>
        <tbody>
          ${
            errorRowsHtml ||
            `<tr><td colspan="5" class="small">אין שורות שגויות</td></tr>`
          }
        </tbody>
      </table>

      <h2>טבלת השלמות 0 מוביל (נוספו למערכת, נדרש אימות מול התלמיד)</h2>
      <table>
        <thead>
          <tr>
            <th>מספר שורה</th>
            <th>ת"ז שנשמרה</th>
            <th>ת"ז שהוזנה</th>
            <th>שם מלא</th>
            <th>אימייל</th>
            <th>הערה</th>
          </tr>
        </thead>
        <tbody>
          ${
            paddedRowsHtml ||
            `<tr><td colspan="6" class="small">אין רשומות שהושלם להן 0</td></tr>`
          }
        </tbody>
      </table>

      <div class="small">
        הערות: מספר השורה מתייחס לשורה בגליון כולל כותרת בשורה 1.
      </div>
    </body>
  </html>`;

  const browser = await puppeteer.launch({
    // במידת הצורך בסביבה נעולה הוסף:
    // args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();
  return pdfBuffer;
}

module.exports = { generatePdfReport };
