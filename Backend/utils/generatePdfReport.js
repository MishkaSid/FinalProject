







// Backend/utils/generatePdfReport.js
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const {getAsBuffer} = require("../font/NotoSansHebrew-Regular.ttf.cjs")

const bidi = require("bidi-js")();

/**
 * Helper to check if character is Hebrew
 */
function isHebrewChar(char) {
  const code = char.charCodeAt(0);
  return (code >= 0x0590 && code <= 0x05FF) || (code >= 0xFB1D && code <= 0xFB4F);
}

/**
 * Helper to check if character is a digit
 */
function isDigit(char) {
  const code = char.charCodeAt(0);
  return code >= 0x0030 && code <= 0x0039;
}

/**
 * Helper to check if character is English letter
 */
function isEnglish(char) {
  const code = char.charCodeAt(0);
  return (code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A);
}

/**
 * Reorder text for PDF display using bidi-js algorithm
 * @param {string} text - The text to reorder
 * @returns {string} - The reordered text for RTL PDF rendering
 */
function reorderTextForPdf(text) {
  if (!text) return "";
  
  const str = String(text);

  // Check if text contains Hebrew and LTR characters (letters or digits)
  const hasRTL = /[\u0590-\u08FF]/.test(str);
  const hasEnglish = /[A-Za-z]/.test(str);
  const hasDigits = /[0-9]/.test(str);

  // Pure English - reverse for RTL rendering
  if (hasEnglish && !hasRTL && !hasDigits) {
    return str.split('').reverse().join('');
  }

  // Pure Hebrew (may contain spaces and punctuation, but no Latin) - keep as is
  if (hasRTL && !hasEnglish && !hasDigits) {
    return str;
  }

  // Hebrew with only digits (no English letters) - manually handle
  if (hasRTL && !hasEnglish && hasDigits) {
    // Split into Hebrew and digit segments, keep both as-is
    const segments = [];
    let currentSegment = "";
    let isCurrentDigit = null;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const isDigitChar = isDigit(char);
      
      if (isCurrentDigit === null) {
        isCurrentDigit = isDigitChar;
        currentSegment = char;
      } else if (isCurrentDigit === isDigitChar) {
        currentSegment += char;
      } else {
        segments.push({ text: currentSegment, isDigit: isCurrentDigit });
        currentSegment = char;
        isCurrentDigit = isDigitChar;
      }
    }
    if (currentSegment) {
      segments.push({ text: currentSegment, isDigit: isCurrentDigit });
    }
    
    // Keep everything in original order for Hebrew+digits
    return segments.map(seg => seg.text).join('');
  }

  // Mixed content (Hebrew + English) - manual segmentation approach
  // Split the original text into segments by character type
  const segments = [];
  let currentSegment = "";
  let currentType = null; // 'hebrew', 'digit', 'english', 'other'
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    let charType;
    
    if (isHebrewChar(char)) {
      charType = 'hebrew';
    } else if (isDigit(char)) {
      charType = 'digit';
    } else if (isEnglish(char)) {
      charType = 'english';
    } else if (char === ' ') {
      charType = 'space';
    } else {
      charType = 'other';
    }
    
    if (currentType === null) {
      currentType = charType;
      currentSegment = char;
    } else if (currentType === charType) {
      currentSegment += char;
    } else {
      segments.push({ text: currentSegment, type: currentType });
      currentSegment = char;
      currentType = charType;
    }
  }
  if (currentSegment) {
    segments.push({ text: currentSegment, type: currentType });
  }
  
  // For RTL rendering: reverse segment order AND reverse Hebrew character order
  const result = segments.reverse().map(seg => {
    if (seg.type === 'hebrew') {
      return seg.text.split('').reverse().join(''); // Reverse Hebrew characters for RTL
    } else if (seg.type === 'digit') {
      return seg.text; // Keep numbers in original order
    } else if (seg.type === 'english') {
      return seg.text; // Keep English as-is (LTR text in RTL context)
    } else {
      return seg.text; // Keep spaces and punctuation as-is
    }
  }).join('');
  
  return result;
}

/**
 * Build and return a PDF Buffer for invalid Excel rows and padded IDs using pdf-lib.
 * @param {Object} params
 * @param {string} params.sourceFileName
 * @param {Array}  params.errors - [{ rowNumber, id, name, email, reasons: [] }]
 * @param {Array}  params.paddedWarnings - [{ rowNumber, paddedId, originalId, name, email, note }]
 * @param {number} params.addedCount
 * @param {number} params.totalCount
 */
async function generatePdfReport({
  sourceFileName,
  errors = [],
  paddedWarnings = [],
  addedCount = 0,
  totalCount = 0,
}) {
  const now = new Date().toLocaleString("he-IL", { hour12: false });

  // Create document
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Try embedding a Hebrew capable font
  let hebrewFont;
  try {
    hebrewFont = await pdfDoc.embedFont(getAsBuffer(), { subset: true });
  } catch {
    // Fallback - will draw glyphs, but shaping is basic
    // For best Hebrew results, provide a proper TTF as above
    hebrewFont = await pdfDoc.embedFont("Helvetica");
  }

  // Page setup - A4 portrait
  const pageMargin = 40;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const headerColor = rgb(0.95, 0.95, 0.95);
  const lineColor = rgb(0.8, 0.8, 0.8);
  const textColor = rgb(0, 0, 0);

  // Helpers
  const rtl = (s) => {
    if (s == null) return "";
    return reorderTextForPdf(String(s));
  };
  
  const mmToPt = (mm) => (mm * 72) / 25.4;

  const drawTextRTL = (page, text, xRight, y, font, size) => {
    const t = rtl(text);
    const width = font.widthOfTextAtSize(t, size);
    page.drawText(t, { x: xRight - width, y, size, font, color: textColor });
    return width;
  };

  const wrapTextRTL = (text, font, fontSize, maxWidth) => {
    const str = String(text || "");
    if (!str) return [""];
    
    const words = str.split(" ");
    const lines = [];
    let current = "";

    for (const w of words) {
      const test = current ? `${current} ${w}` : w;
      // Measure the RTL text width
      const testRTL = rtl(test);
      const width = font.widthOfTextAtSize(testRTL, fontSize);
      
      if (width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        // If a single word is too long, force it to fit
        const wordWidth = font.widthOfTextAtSize(rtl(w), fontSize);
        if (wordWidth > maxWidth) {
          // Truncate long word with ellipsis
          current = w.substring(0, Math.floor(w.length * maxWidth / wordWidth) - 3) + "...";
        } else {
          current = w;
        }
      }
    }
    if (current) lines.push(current);
    return lines.length > 0 ? lines : [""];
  };

  const addPage = () => pdfDoc.addPage([pageWidth, pageHeight]);

  // Table drawer for RTL
  const drawTable = ({
    page,
    startY,
    columns, // [{ header, width }]
    rows, // array of arrays (strings)
    font,
    fontSize = 10,
    headerFontSize = 11,
    rowHeight = 20,
    headerHeight = 22,
    zebra = false,
  }) => {
    let y = startY;
    const rightEdge = pageWidth - pageMargin;
    const leftEdge = pageMargin;
    const minY = pageMargin;

    // Compute x positions from right to left
    const xPositions = [];
    let cursor = rightEdge;
    for (const col of columns) {
      const xLeft = cursor - col.width;
      xPositions.push({ xLeft, xRight: cursor, width: col.width });
      cursor = xLeft;
    }

    const drawHeader = () => {
      // Backdrop
      page.drawRectangle({
        x: xPositions[xPositions.length - 1].xLeft,
        y: y - headerHeight + 2,
        width: rightEdge - xPositions[xPositions.length - 1].xLeft,
        height: headerHeight,
        color: headerColor,
        borderColor: lineColor,
        borderWidth: 0.5,
      });

      // Borders
      page.drawLine({
        start: { x: leftEdge, y: y + 2 },
        end: { x: rightEdge, y: y + 2 },
        color: lineColor,
        thickness: 0.5,
      });

      const textY = y - headerHeight + 7;
      columns.forEach((col, idx) => {
        const cell = xPositions[idx];
        drawTextRTL(page, col.header, cell.xRight - 6, textY, font, headerFontSize);
        // Vertical separators
        page.drawLine({
          start: { x: cell.xLeft, y: y + 2 },
          end: { x: cell.xLeft, y: y - headerHeight + 2 },
          color: lineColor,
          thickness: 0.5,
        });
      });

      // Bottom line
      page.drawLine({
        start: { x: leftEdge, y: y - headerHeight + 2 },
        end: { x: rightEdge, y: y - headerHeight + 2 },
        color: lineColor,
        thickness: 0.5,
      });

      y -= headerHeight;
    };

    const ensureSpace = (needed) => {
      if (y - needed < minY) {
        // New page
        const newPage = addPage();
        page = newPage;
        y = pageHeight - pageMargin;
        // Redraw header on the new page
        drawHeader();
      }
      return page;
    };

    // Draw header initially
    drawHeader();

    if (!rows.length) {
      ensureSpace(rowHeight);
      // Single empty row
      const colSpanLeft = xPositions[xPositions.length - 1].xLeft;
      page.drawRectangle({
        x: colSpanLeft,
        y: y - rowHeight + 2,
        width: rightEdge - colSpanLeft,
        height: rowHeight,
        color: rgb(1, 1, 1),
        borderColor: lineColor,
        borderWidth: 0.5,
      });
      drawTextRTL(
        page,
        "אין נתונים",
        rightEdge - 6,
        y - rowHeight + 6,
        font,
        fontSize
      );
      y -= rowHeight;
      return { page, y };
    }

    // Draw rows
    rows.forEach((row, rowIdx) => {
      // Row background
      if (zebra && rowIdx % 2 === 1) {
        const colSpanLeft = xPositions[xPositions.length - 1].xLeft;
        page.drawRectangle({
          x: colSpanLeft,
          y: y - rowHeight + 2,
          width: rightEdge - colSpanLeft,
          height: rowHeight,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      // Measure wrapped lines per cell to compute row height growth
      const cellLines = row.map((cell, idx) => {
        const cellWidth = xPositions[idx].width - 12;
        return wrapTextRTL(cell ?? "", font, fontSize, cellWidth);
      });
      const maxLines = Math.max(1, ...cellLines.map((l) => l.length));
      const effectiveHeight = Math.max(rowHeight, 6 + maxLines * (fontSize + 2));

      page = ensureSpace(effectiveHeight);

      // Draw cell borders and text
      columns.forEach((col, idx) => {
        const cell = xPositions[idx];
        // Borders
        page.drawRectangle({
          x: cell.xLeft,
          y: y - effectiveHeight + 2,
          width: cell.width,
          height: effectiveHeight,
          borderColor: lineColor,
          borderWidth: 0.5,
          color: undefined,
        });

        // Text lines
        const lines = cellLines[idx];
        let textY = y - 6 - fontSize;
        for (const line of lines) {
          drawTextRTL(page, line, cell.xRight - 6, textY, font, fontSize);
          textY -= fontSize + 2;
        }
      });

      y -= effectiveHeight;
    });

    return { page, y };
  };

  // Start first page
  let page = addPage();
  let y = pageHeight - pageMargin;

  // Title
  const titleSize = 18;
  drawTextRTL(page, "דו\"ח קליטת Excel", pageWidth - pageMargin, y, hebrewFont, titleSize);
  y -= 28;

  // Meta
  const metaSize = 11;
  const metaLines = [
    `תאריך יצירה: ${now}`,
    `קובץ מקור: ${sourceFileName || ""}`,
    `סיכום: נוספו ${addedCount} מתוך ${totalCount}. נמצאו ${errors.length} שורות בעייתיות. בוצעה השלמת 0 מוביל ל-${paddedWarnings.length} נבחנים.`,
  ];
  for (const line of metaLines) {
    drawTextRTL(page, line, pageWidth - pageMargin, y, hebrewFont, metaSize);
    y -= 16;
  }
  y -= 6;

  // Section: Errors
  const sectionSize = 14;
  drawTextRTL(page, "טבלת שגיאות ", pageWidth - pageMargin, y, hebrewFont, sectionSize);
  y -= 20;

  // Calculate available width for tables (page width - both margins)
  const availableWidth = pageWidth - (2 * pageMargin);
  
  // Helper to validate and adjust column widths
  const validateColumnWidths = (columns) => {
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
    if (totalWidth > availableWidth) {
      console.warn(`Table width ${totalWidth} exceeds available width ${availableWidth}. Scaling down.`);
      const scale = availableWidth / totalWidth;
      return columns.map(col => ({ ...col, width: Math.floor(col.width * scale) }));
    }
    return columns;
  };
  
  let errorColumns = [
    { header: "מספר שורה", width: 70 },
    { header: "ת\"ז", width: 90 },
    { header: "שם מלא", width: 120 },
    { header: "אימייל", width: 130 },
    { header: "סיבת כישלון", width: 105 },
  ];
  errorColumns = validateColumnWidths(errorColumns);

  const errorRows = (errors || []).map((e) => [
    String(e.rowNumber ?? ""),
    String(e.id ?? ""),
    String(e.name ?? ""),
    String(e.email ?? ""),
    Array.isArray(e.reasons) ? e.reasons.join(", ") : String(e.reasons ?? ""),
  ]);

  ({ page, y } = drawTable({
    page,
    startY: y,
    columns: errorColumns,
    rows: errorRows,
    font: hebrewFont,
    fontSize: 10,
    headerFontSize: 11,
    rowHeight: 22,
    headerHeight: 24,
    zebra: true,
  }));

  y -= 14;

  // Section: Padded IDs
  drawTextRTL(
    page,
    "טבלת השלמות 0 מוביל )נוספו למערכת, נדרש אימות מול התלמיד)",
    pageWidth - pageMargin,
    y,
    hebrewFont,
    sectionSize
  );
  y -= 20;

  let paddedColumns = [
    { header: "מספר שורה", width: 65 },
    { header: "ת\"ז שנשמרה", width: 85 },
    { header: "ת\"ז שהוזנה", width: 85 },
    { header: "שם מלא", width: 100 },
    { header: "אימייל", width: 120 },
    { header: "הערה", width: 60 },
  ];
  paddedColumns = validateColumnWidths(paddedColumns);

  const paddedRows = (paddedWarnings || []).map((e) => [
    String(e.rowNumber ?? ""),
    String(e.paddedId ?? ""),
    String(e.originalId ?? ""),
    String(e.name ?? ""),
    String(e.email ?? ""),
    String(e.note ?? ""),
  ]);

  ({ page, y } = drawTable({
    page,
    startY: y,
    columns: paddedColumns,
    rows: paddedRows,
    font: hebrewFont,
    fontSize: 10,
    headerFontSize: 11,
    rowHeight: 22,
    headerHeight: 24,
    zebra: true,
  }));

  y -= 10;

  // Footer note
  drawTextRTL(
    page,
    "הערות: מספר השורה מתייחס לשורה בגליון כולל כותרת בשורה 1.",
    pageWidth - pageMargin,
    Math.max(y, pageMargin),
    hebrewFont,
    9
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { generatePdfReport };
