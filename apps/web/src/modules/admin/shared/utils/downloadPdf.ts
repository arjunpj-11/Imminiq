export type PdfCell = string | number | null | undefined;

export type PdfColumn = {
  header: string;
  key: string;
  width?: number;
};

type PdfReportOptions = {
  filename: string;
  title: string;
  description: string;
  filters?: string[];
  summary?: Array<{ label: string; value: PdfCell }>;
  columns: PdfColumn[];
  rows: Array<Record<string, PdfCell>>;
  orientation?: 'portrait' | 'landscape';
};

export const downloadTablePdf = async ({
  filename,
  title,
  description,
  filters = [],
  summary = [],
  columns,
  rows,
  orientation = 'landscape',
}: PdfReportOptions) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const document = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const margin = 36;
  const totalPagesToken = '{total_pages_count_string}';

  document.setFillColor(28, 26, 24);
  document.rect(0, 0, pageWidth, 96, 'F');
  document.setTextColor(232, 129, 106);
  document.setFont('helvetica', 'bold');
  document.setFontSize(10);
  document.text('IMMINIQ ADMIN REPORT', margin, 27);
  document.setTextColor(255, 255, 255);
  document.setFontSize(22);
  document.text(title, margin, 53);
  document.setTextColor(190, 185, 177);
  document.setFont('helvetica', 'normal');
  document.setFontSize(9);
  document.text(description, margin, 72, { maxWidth: pageWidth - margin * 2 - 180 });
  document.text(`Generated ${new Date().toLocaleString()}`, pageWidth - margin, 27, {
    align: 'right',
  });

  let cursorY = 116;
  if (summary.length) {
    const gap = 8;
    const cardWidth = (pageWidth - margin * 2 - gap * (summary.length - 1)) / summary.length;
    summary.forEach((item, index) => {
      const x = margin + index * (cardWidth + gap);
      document.setFillColor(246, 242, 238);
      document.roundedRect(x, cursorY, cardWidth, 48, 4, 4, 'F');
      document.setTextColor(104, 96, 89);
      document.setFont('helvetica', 'normal');
      document.setFontSize(7.5);
      document.text(item.label.toUpperCase(), x + 10, cursorY + 16);
      document.setTextColor(35, 32, 29);
      document.setFont('helvetica', 'bold');
      document.setFontSize(14);
      document.text(String(item.value ?? '-'), x + 10, cursorY + 35, {
        maxWidth: cardWidth - 20,
      });
    });
    cursorY += 62;
  }

  if (filters.length) {
    document.setTextColor(104, 96, 89);
    document.setFont('helvetica', 'normal');
    document.setFontSize(8.5);
    document.text(filters.join('  |  '), margin, cursorY, { maxWidth: pageWidth - margin * 2 });
    cursorY += 18;
  }

  autoTable(document, {
    startY: cursorY,
    margin: { top: 52, right: margin, bottom: 34, left: margin },
    head: [columns.map((column) => column.header)],
    body: rows.map((row) => columns.map((column) => String(row[column.key] ?? '-'))),
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 5,
      lineColor: [222, 214, 207],
      lineWidth: 0.4,
      overflow: 'linebreak',
      valign: 'top',
      textColor: [45, 41, 37],
    },
    headStyles: {
      fillColor: [82, 73, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      lineColor: [82, 73, 66],
    },
    alternateRowStyles: { fillColor: [250, 248, 246] },
    rowPageBreak: 'avoid',
    columnStyles: Object.fromEntries(
      columns
        .map((column, index) => ({ column, index }))
        .filter(({ column }) => column.width)
        .map(({ column, index }) => [index, { cellWidth: column.width }])
    ),
    willDrawPage: ({ pageNumber }) => {
      if (pageNumber > 1) {
        document.setFillColor(255, 255, 255);
        document.rect(0, 0, pageWidth, pageHeight, 'F');
        document.setTextColor(232, 129, 106);
        document.setFont('helvetica', 'bold');
        document.setFontSize(9);
        document.text(`IMMINIQ  /  ${title}`, margin, 28);
      }
    },
    didDrawPage: ({ pageNumber }) => {
      document.setFillColor(255, 255, 255);
      document.rect(0, pageHeight - 30, pageWidth, 30, 'F');
      document.setTextColor(125, 118, 111);
      document.setFont('helvetica', 'normal');
      document.setFontSize(8);
      document.text('Confidential administrative report', margin, pageHeight - 16);
      document.text(
        `Page ${pageNumber} of ${totalPagesToken}`,
        pageWidth - margin,
        pageHeight - 16,
        {
          align: 'right',
        }
      );
    },
  });

  document.putTotalPages(totalPagesToken);
  document.save(filename);
};
