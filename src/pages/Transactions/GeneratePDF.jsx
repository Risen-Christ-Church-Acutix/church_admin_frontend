import { useState } from "react";
import { Button } from "../../components/ui/Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToaster } from "../../components/Toaster";

const getDateRange = (transactions) => {
  if (!transactions || transactions.length === 0) return "No transactions";
  const dates = transactions.map(t => new Date(t.datetime));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  return `${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`;
};

const generatePDF = (transactions) => {
  try {
    const doc = new jsPDF();
    
    // Document title and metadata
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Transaction Report", 14, 20);
    
    // Date range info
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date Range: ${getDateRange(transactions)}`, 14, 28);
    
    // Prepare table data
    const tableData = transactions.map((t, index) => [
      index + 1,
      t.amount.toFixed(2), // Remove Rupee symbol from amount
      t.description.length > 30 ? t.description.substring(0, 27) + "..." : t.description,
      new Date(t.datetime).toLocaleString(),
      t.transactionType,
      t.category.replace("_", " ")
    ]);

    // Generate table with autoTable
    autoTable(doc, {
      startY: 35,
      head: [['S.No', 'Amount (In Rupees)', 'Description', 'Date & Time', 'Type', 'Category']], // Update column header
      body: tableData,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'middle',
        halign: 'left'
      },
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
      margin: { top: 35, left: 14, right: 14 }
    });

    // Generate filename with date range
    const dateRange = getDateRange(transactions).replace(/ to /, '_to_').replace(/\//g, '-');
    const filename = `Transaction_Report_${dateRange}.pdf`;
    
    // Trigger automatic download
    doc.save(filename);
    return true;
  } catch (err) {
    console.error("Error generating PDF:", err);
    throw err;
  }
};

const GeneratePDFModal = ({ transactions, buttonContent, buttonClassName }) => {
  const { success, error } = useToaster();

  const handleGeneratePDF = () => {
    try {
      generatePDF(transactions);
      success("PDF report downloaded successfully");
    } catch (err) {
      error("Failed to generate PDF report");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGeneratePDF}
      className={`border-amber-300 text-amber-700 hover:bg-amber-50 ${buttonClassName}`}
    >
      {buttonContent}
    </Button>
  );
};

export default GeneratePDFModal;