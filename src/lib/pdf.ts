import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Expense, Source, Tag } from "./types";
import { APP_DISPLAY_NAME, APP_SHORT_NAME } from "./app-brand";
import {
  currencyDisplay,
  DEFAULT_CURRENCY,
  formatMoney,
} from "./currency";

/**
 * Helvetica en jsPDF solo cubre bien WinAnsi (~Latin-1). Emoji, pictos y muchos
 * Unicode corrompen el texto y hacen fallar el cálculo de anchos en autotable.
 * Para emoji “real” en PDF habría que embeber una TTF (p. ej. Noto Sans + Noto Color Emoji).
 */
export function sanitizeTextForPdf(text: string): string {
  let s = String(text).normalize("NFKC");
  s = s.replace(/\p{Extended_Pictographic}/gu, "");
  s = s.replace(/\uFE0F/g, "");
  s = s.replace(/[\u200B-\u200F\u2028\u2029\uFEFF]/g, "");
  s = s.replace(/\u00A0/g, " ");
  const typographic: Record<string, string> = {
    "\u2018": "'",
    "\u2019": "'",
    "\u201C": '"',
    "\u201D": '"',
    "\u2013": "-",
    "\u2014": "-",
    "\u2026": "...",
  };
  s = s.replace(
    /[\u2018\u2019\u201C\u201D\u2013\u2014\u2026]/g,
    (c) => typographic[c] ?? c
  );
  const folded = Array.from(s, (ch) => {
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x20 && cp <= 0x7e) return ch;
    if (cp >= 0xa0 && cp <= 0xff) return ch;
    return "";
  }).join("");
  return folded.replace(/\s+/g, " ").trim();
}

interface ReportData {
  expenses: Expense[];
  sources: Source[];
  tags: Tag[];
  startDate: number;
  endDate: number;
  title?: string;
}

function expenseCurrency(e: Expense): string {
  return e.currency?.trim() || DEFAULT_CURRENCY;
}

function totalsByCurrency(expenses: Expense[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of expenses) {
    const c = expenseCurrency(e);
    map.set(c, (map.get(c) ?? 0) + e.amount);
  }
  return map;
}

export function generateExpenseReport(data: ReportData): jsPDF {
  const doc = new jsPDF();
  const { expenses, sources, tags, startDate, endDate, title } = data;

  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const tagMap = new Map(tags.map((t) => [t.id, t]));

  const rangeLabel = `${format(startDate, "dd MMM yyyy", {
    locale: es,
  })} - ${format(endDate, "dd MMM yyyy", { locale: es })}`;

  const currencyTotals = totalsByCurrency(expenses);
  const hasTaxBreakdown = expenses.some((e) => (e.taxAmount ?? 0) > 0);

  doc.setFontSize(18);
  doc.text(
    sanitizeTextForPdf(title || `Reporte de Gastos - ${APP_DISPLAY_NAME}`),
    14,
    22
  );

  doc.setFontSize(11);
  doc.setTextColor(100);
  let yHead = 32;
  doc.text(`Período: ${rangeLabel}`, 14, yHead);
  yHead += 7;
  doc.text(`Gastos registrados: ${expenses.length}`, 14, yHead);
  yHead += 7;

  if (currencyTotals.size === 0) {
    doc.text("Total: —", 14, yHead);
    yHead += 7;
  } else {
    doc.text("Totales por moneda:", 14, yHead);
    yHead += 6;
    for (const [code, sum] of currencyTotals) {
      doc.text(
        sanitizeTextForPdf(`  ${formatMoney(sum, code)}`),
        14,
        yHead
      );
      yHead += 5;
    }
  }

  const sorted = [...expenses].sort((a, b) => a.date - b.date);

  const tableStartY = Math.max(yHead + 4, 54);

  if (hasTaxBreakdown) {
    const tableData = sorted.map((e) => {
      const tax = e.taxAmount ?? 0;
      const subtotal = tax > 0 ? e.amount - tax : e.amount;
      const cur = expenseCurrency(e);
      return [
        format(e.date, "dd/MM/yyyy"),
        sanitizeTextForPdf(e.description),
        sanitizeTextForPdf(sourceMap.get(e.sourceId)?.name ?? "—"),
        sanitizeTextForPdf(
          e.tagIds
            .map((id) => tagMap.get(id)?.name ?? "")
            .filter(Boolean)
            .join(", ") || "—"
        ),
        sanitizeTextForPdf(currencyDisplay(cur)),
        subtotal.toFixed(2),
        tax > 0 ? tax.toFixed(2) : "—",
        e.amount.toFixed(2),
      ];
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [
        [
          "Fecha",
          "Descripción",
          "Cuenta",
          "Tags",
          "Moneda",
          "Subtotal",
          "Impuesto",
          "Total",
        ],
      ],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 30] },
      columnStyles: {
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
      },
    });
  } else {
    const tableData = sorted.map((e) => [
      format(e.date, "dd/MM/yyyy"),
      sanitizeTextForPdf(e.description),
      sanitizeTextForPdf(sourceMap.get(e.sourceId)?.name ?? "—"),
      sanitizeTextForPdf(
        e.tagIds
          .map((id) => tagMap.get(id)?.name ?? "")
          .filter(Boolean)
          .join(", ") || "—"
      ),
      sanitizeTextForPdf(currencyDisplay(expenseCurrency(e))),
      e.amount.toFixed(2),
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [["Fecha", "Descripción", "Cuenta", "Tags", "Moneda", "Monto"]],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 30, 30] },
      columnStyles: {
        5: { halign: "right" },
      },
    });
  }

  // Resumen por cuenta + moneda
  const bySourceCurrency = new Map<string, number>();
  for (const e of expenses) {
    const key = `${e.sourceId}\0${expenseCurrency(e)}`;
    bySourceCurrency.set(key, (bySourceCurrency.get(key) ?? 0) + e.amount);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? 80;
  let y = finalY + 14;

  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.text("Resumen por cuenta", 14, y);
  y += 8;

  const summaryData = Array.from(bySourceCurrency.entries()).map(
    ([key, amount]) => {
      const [sourceId, cur] = key.split("\0");
      const currencyTotal = currencyTotals.get(cur!) ?? 0;
      return [
        sanitizeTextForPdf(sourceMap.get(sourceId!)?.name ?? "—"),
        sanitizeTextForPdf(currencyDisplay(cur!)),
        amount.toFixed(2),
        currencyTotal > 0
          ? `${((amount / currencyTotal) * 100).toFixed(1)}%`
          : "0%",
      ];
    }
  );

  autoTable(doc, {
    startY: y,
    head: [["Cuenta", "Moneda", "Monto", "% de esa moneda"]],
    body: summaryData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30] },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `${APP_SHORT_NAME} - Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  return doc;
}
