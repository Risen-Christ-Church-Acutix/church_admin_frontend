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
      `$${t.amount.toFixed(2)}`,
      t.description.length > 30 ? t.description.substring(0, 27) + "..." : t.description,
      new Date(t.datetime).toLocaleString(),
      t.transactionType,
      t.category.replace("_", " ")
    ]);

    // Generate table with autoTable
    autoTable(doc, {
      startY: 35,
      head: [['S.No', 'Amount', 'Description', 'Date & Time', 'Type', 'Category']],
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

    const pdfBlob = doc.output("blob");
    return URL.createObjectURL(pdfBlob);
  } catch (err) {
    console.error("Error generating PDF:", err);
    throw err;
  }
};

const GeneratePDFModal = ({ transactions, buttonContent, buttonClassName }) => {
  const { success, error } = useToaster();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleGeneratePDF = () => {
    try {
      const url = generatePDF(transactions);
      setPdfUrl(url);
      setShowModal(true);
      success("PDF report generated successfully");
    } catch (err) {
      error("Failed to generate PDF report");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleGeneratePDF}
        className={`border-amber-300 text-amber-700 hover:bg-amber-50 ${buttonClassName}`}
      >
        {buttonContent}
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-amber-50">
              <div>
                <h2 className="text-xl font-bold text-amber-900">Transaction Report</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Date Range: {getDateRange(transactions)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={closeModal}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Close
              </Button>
            </div>
            <div className="flex-1 p-6 bg-gray-50">
              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="Transaction Report"
                  className="w-full h-full rounded-lg border border-gray-200 shadow-inner"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeneratePDFModal;