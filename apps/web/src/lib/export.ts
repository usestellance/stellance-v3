// utils/exportUtils.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface Invoice {
  id: number;
  invoice_number: string;
  payer_name: string;
  amount: number;
  status: string;
  date: string;
  description?: string;
}

// ================================
// PDF EXPORT
// ================================
export const exportToPDF = (invoices: Invoice[], filename = "receipts.pdf") => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text("Receipt Report", 14, 22);

  // Add metadata
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Total Receipts: ${invoices.length}`, 14, 36);

  // Prepare table data
  const tableData = invoices.map((inv) => [
    inv.invoice_number,
    inv.payer_name,
    `$${inv?.amount?.toFixed(2)}`,
    inv.status,
    new Date(inv.date).toLocaleDateString(),
  ]);

  // Add table
  autoTable(doc, {
    head: [["Invoice #", "Payer Name", "Amount", "Status", "Date"]],
    body: tableData,
    startY: 42,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] }, // Primary blue
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 249, 255] },
  });

  // Add summary
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const finalY = (doc as any).lastAutoTable.finalY || 42;

  doc.setFontSize(11);
  doc.text(`Total Amount: $${totalAmount?.toFixed(2)}`, 14, finalY + 10);

  // Save the PDF
  doc.save(filename);
};

// ================================
// EXCEL EXPORT
// ================================
export const exportToExcel = (
  invoices: Invoice[],
  filename = "receipts.xlsx"
) => {
  // Prepare data
  const data = invoices.map((inv) => ({
    "Invoice Number": inv.invoice_number,
    "Payer Name": inv.payer_name,
    Amount: inv.amount,
    Status: inv.status,
    Date: new Date(inv.date).toLocaleDateString(),
    Description: inv.description || "",
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws["!cols"] = [
    { wch: 15 }, // Invoice Number
    { wch: 20 }, // Payer Name
    { wch: 12 }, // Amount
    { wch: 12 }, // Status
    { wch: 12 }, // Date
    { wch: 30 }, // Description
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Receipts");

  // Save file
  XLSX.writeFile(wb, filename);
};

// ================================
// CSV EXPORT
// ================================
export const exportToCSV = (invoices: Invoice[], filename = "receipts.csv") => {
  // Prepare data
  const data = invoices.map((inv) => ({
    "Invoice Number": inv.invoice_number,
    "Payer Name": inv.payer_name,
    Amount: inv.amount,
    Status: inv.status,
    Date: new Date(inv.date).toLocaleDateString(),
    Description: inv.description || "",
  }));

  // Create worksheet and export as CSV
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ================================
// PRINT FUNCTIONALITY
// ================================
export const printReceipts = (invoices: Invoice[]) => {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow popups for this site to print receipts");
    return;
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #3b82f6;
        }
        .metadata {
          margin: 20px 0;
          font-size: 14px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #3b82f6;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f0f9ff;
        }
        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .status.paid {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status.pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status.overdue {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .summary {
          margin-top: 30px;
          padding: 15px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .summary h3 {
          margin: 0 0 10px 0;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Receipt Report</h1>
      </div>
      
      <div class="metadata">
        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p><strong>Total Receipts:</strong> ${invoices.length}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Payer Name</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${invoices
            .map(
              (inv) => `
            <tr>
              <td>${inv.invoice_number}</td>
              <td>${inv.payer_name}</td>
              <td>$${inv.amount?.toFixed(2)}</td>
              <td><span class="status ${inv.status.toLowerCase()}">${
                inv.status
              }</span></td>
              <td>${new Date(inv.date).toLocaleDateString()}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Amount:</strong> $${totalAmount?.toFixed(2)}</p>
        <p><strong>Paid:</strong> ${
          invoices.filter((i) => i.status.toLowerCase() === "paid").length
        }</p>
        <p><strong>Pending:</strong> ${
          invoices.filter((i) => i.status.toLowerCase() === "pending").length
        }</p>
        <p><strong>Overdue:</strong> ${
          invoices.filter((i) => i.status.toLowerCase() === "overdue").length
        }</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
