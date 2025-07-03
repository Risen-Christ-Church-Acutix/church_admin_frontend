import React from "react";
import { Button } from "../../components/ui/Button";
import { useToaster } from "../../components/Toaster";
import * as XLSX from "xlsx";

const getDateRange = (filters) => {
  try {
    console.log("getDateRange called with filters:", filters);
    if (!filters.dateFrom && !filters.dateTo && !filters.period) return "All dates";
    if (filters.period) {
      const today = new Date();
      let dateFrom = new Date(today);
      if (filters.period === "1_MONTH") dateFrom.setMonth(today.getMonth() - 1);
      else if (filters.period === "3_MONTHS") dateFrom.setMonth(today.getMonth() - 3);
      else if (filters.period === "6_MONTHS") dateFrom.setMonth(today.getMonth() - 6);
      else if (filters.period === "12_MONTHS") dateFrom.setFullYear(today.getFullYear() - 1);
      return `${dateFrom.toLocaleDateString()} to ${today.toLocaleDateString()}`;
    }
    const from = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : "Start";
    const to = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : "End";
    return `${from} to ${to}`;
  } catch (err) {
    console.warn("Error in getDateRange:", err.message, err.stack);
    return "Unknown date range";
  }
};

const generateExcel = (transactions, filters) => {
  try {
    console.log("Starting Excel generation with transactions count:", transactions.length, "filters:", filters);

    // Prepare data for Excel
    const data = [
      ["Transaction Report"],
      [`Date Range: ${getDateRange(filters)}`],
      [], // Empty row for spacing
      ["S.No", "Amount (In Rupees)", "Description", "Date & Time", "Type", "Category"],
      ...transactions.map((t, index) => [
        index + 1,
        t.amount.toFixed(2), // Remove dollar symbol from amount
        t.description,
        new Date(t.datetime).toLocaleString(),
        t.transactionType,
        t.category.replace("_", " "),
      ]),
    ];

    console.log("Prepared data for Excel, rows:", data.length);

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    console.log("Created workbook");

    // Create worksheet with data
    const ws = XLSX.utils.aoa_to_sheet(data);
    console.log("Created worksheet");

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    console.log("Appended worksheet to workbook");

    // Generate Excel file as binary string and trigger download
    const fileName = `Transaction_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    console.log("Generating Excel file:", fileName);

    // Write workbook as binary string
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    console.log("Excel buffer generated, length:", excelBuffer.length);

    // Convert binary string to Blob for download
    const s2ab = (s) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    };

    const blob = new Blob([s2ab(excelBuffer)], { type: "application/octet-stream" });
    console.log("Blob created for download");

    // Create download link and trigger click
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    console.log("Download triggered and link cleaned up");

    return true;
  } catch (err) {
    console.error("Error generating Excel:", err.message, err.stack);
    throw new Error(`Failed to generate Excel: ${err.message}`);
  }
};

const GenerateExcelModal = ({ transactions, filters, buttonContent, buttonClassName }) => {
  const { success, error } = useToaster();

  const handleGenerateExcel = () => {
    try {
      console.log("Handle generate Excel clicked, transactions count:", transactions.length);
      generateExcel(transactions, filters);
      success("Excel report generated and downloaded successfully");
    } catch (err) {
      console.error("Handle generate Excel error:", err.message, err.stack);
      error(err.message);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGenerateExcel}
      className={`border-green-300 text-green-700 hover:bg-green-50 ${buttonClassName}`}
    >
      {buttonContent}
    </Button>
  );
};

export default GenerateExcelModal;