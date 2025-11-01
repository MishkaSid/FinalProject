const { jsPDF } = require("jspdf");
const { getAsBuffer } = require("./NotoSansHebrew-Regular.ttf.cjs");

async function generatePdfReport({
  sourceFileName,
  errors = [],
  paddedWarnings = [],
  addedCount = 0,
  totalCount = 0,
}) {
  const doc = new jsPDF();

  // Embed Hebrew font
  doc.addFileToVFS("MyFont.ttf", getAsBuffer().toString("base64"));
  doc.addFont("MyFont.ttf", "MyFont", "normal");
  doc.setFont("MyFont");

  // --- Helpers ---
  function writeRTL(text, x, y, size = 12, font = "") {
    doc.setFontSize(size);
    const currFont = doc.getFont();
    if (font) doc.setFont(font);
    doc.text(text, x, y, {
    align: "right",
    isInputRtl: true,
    isOutputRtl: false,
    isInputVisual: false,
    isOutputVisual: true,
    isSymmetricSwapping: true,
    }
    );
    doc.setFont(currFont.fontName);
  }

  function drawLine(x1, y1, x2, y2) {
    doc.setDrawColor(...lineColor);
    doc.line(x1, y1, x2, y2);
  }

  function drawRect(x, y, w, h, fill = null, border = true) {
    if (fill) doc.setFillColor(...fill);
    doc.setDrawColor(...lineColor);
    doc.rect(x, y, w, h, fill ? (border ? "FD" : "F") : "S");
  }

  function wrapText(text, maxWidth) {
    if (!text) return [""];
    return doc.splitTextToSize(String(text), maxWidth - 8); // padding inside cell
  }

  // --- Page setup ---
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  const headerColor = [242, 242, 242];
  const lineColor = [204, 204, 204];
  const textColor = [0, 0, 0];

  // --- Title ---
  doc.setTextColor(...textColor);
  writeRTL(`דו"ח קליטת Excel`, pageWidth - margin, y, 18);
  y += 28;

  // --- Meta section ---
  const now = new Date().toLocaleString("he-IL", { hour12: false });
  const metaLines = [
    `תאריך יצירה: ${now}`,
    `קובץ מקור: ${sourceFileName || ""}`,
    `סיכום: נוספו ${addedCount} מתוך ${totalCount}. נמצאו ${errors.length} שורות בעייתיות. בוצעה השלמת 0 מוביל ל-${paddedWarnings.length} נבחנים.`,
  ];
  metaLines.forEach((line) => {
    writeRTL(line, pageWidth - margin, y, 11);
    y += 16;
  });
  y += 10;


  

 function drawTable({ title, columns, rows }) {
  const tableWidth = pageWidth - 2 * margin;
  const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
  const scale = tableWidth / totalWidth;
  const widths = columns.map((c) => c.width * scale);
  const headerHeight = 22;
  const baseRowHeight = 20;
  const rightEdge = pageWidth - margin;

  // --- Draw table title once ---
  writeRTL(title, pageWidth - margin, y, 14);
  y += 22;

  let headerDrawn = false;

  const drawHeader = () => {
    let xCursor = rightEdge;
    for (let i = 0; i < columns.length; i++) {
      const w = widths[i];
      drawRect(xCursor - w, y, w, headerHeight, headerColor);
      const wrapped = wrapText(columns[i].header, w);
      wrapped.forEach((line, j) => {
        writeRTL(line, xCursor - 6, y + 8 + j * 6, 10);
      });
      xCursor -= w;
    }
    drawLine(margin, y + headerHeight, pageWidth - margin, y + headerHeight);
    y += headerHeight;
    headerDrawn = true;
  };

  const ensureSpace = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      headerDrawn = false; // redraw header on new page
    }
    if (!headerDrawn) drawHeader();
  };

  // --- Rows ---
  if (!rows.length) {
    ensureSpace(baseRowHeight + 10);
    drawRect(margin, y, tableWidth, baseRowHeight);
    writeRTL("אין נתונים", pageWidth - margin - 6, y + 14, 10);
    y += baseRowHeight + 10;
    return;
  }

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const bg = rowIndex % 2 ? [250, 250, 250] : null;

    const cellLines = row.map((cell, i) => wrapText(cell, widths[i]));
    const maxLines = Math.max(...cellLines.map((lines) => lines.length));
    const rowHeight = Math.max(baseRowHeight, maxLines * 6 + 8);

    ensureSpace(rowHeight + 4); // this will add page & redraw header if needed

    if (bg) drawRect(margin, y, tableWidth, rowHeight, bg, false);

    let xCursor = rightEdge;
    for (let i = 0; i < row.length; i++) {
      const w = widths[i];
      drawRect(xCursor - w, y, w, rowHeight);
      const lines = cellLines[i];
      lines.forEach((line, j) => {
        writeRTL(line, xCursor - 6, y + 8 + j * 6, 10);
      });
      xCursor -= w;
    }

    y += rowHeight;
   }

   y += 10;
   }




  // --- Error Table ---
  drawTable({
    title: "טבלת שגיאות",
    columns: [
      { header: "מספר שורה", width: 70 },
      { header: 'ת"ז', width: 90 },
      { header: "שם מלא", width: 120 },
      { header: "אימייל", width: 130 },
      { header: "סיבת כישלון", width: 105 },
    ],
    rows: errors.map((e) => [
      e.rowNumber ?? "",
      e.id ?? "",
      e.name ?? "",
      e.email ?? "",
      Array.isArray(e.reasons) ? e.reasons.join(", ") : e.reasons ?? "",
    ]
   ),
    }
   );


  // --- Padded Table ---
    drawTable({
    title: "טבלת השלמות 0 מוביל (נוספו למערכת, נדרש אימות מול התלמיד)",
    columns: [
      { header: "מספר שורה", width: 65 },
      { header: 'ת"ז שנשמרה', width: 85 },
      { header: 'ת"ז שהוזנה', width: 85 },
      { header: "שם מלא", width: 100 },
      { header: "אימייל", width: 120 },
      { header: "הערה", width: 60 },
    ],
    rows: paddedWarnings.map((e) => [
    e.rowNumber ?? "",
    e.paddedId ?? "",
    e.originalId ?? "",
    e.name ?? "",
    e.email ?? "",
    e.note ?? "",
    ]
  ),
  }
  );

  // --- Footer ---
  writeRTL(
  "הערות: מספר השורה מתייחס לשורה בגליון כולל כותרת בשורה 1.",
  pageWidth - margin,
  pageHeight - margin,
  9
  );

  return Buffer.from(doc.output("arraybuffer"));
 }


 module.exports = { generatePdfReportv2: generatePdfReport };
