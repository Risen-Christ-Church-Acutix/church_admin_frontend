import { jsPDF } from 'jspdf';
// Make sure to import the plugin correctly
import 'jspdf-autotable';

/**
 * Generates a smaller receipt-style PDF for event registration and downloads it
 * @param {Object} data - Receipt data from backend
 */
export const generateReceipt = (data) => {
  try {
    const {
      receiptNumber,
      event,
      registrations,
      totalFees,
      registrationDate
    } = data;

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150]
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header with improved styling
    doc.setFillColor(255, 248, 230); // Light amber background
    doc.rect(0, 0, pageWidth, 20, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(184, 83, 0); // Amber text color
    doc.text("Risen Christ Church", pageWidth / 2, 10, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text("Event Registration Receipt", pageWidth / 2, 15, { align: 'center' });
    
    // Divider line
    doc.setDrawColor(222, 135, 4); // Amber line
    doc.setLineWidth(0.5);
    doc.line(5, 22, pageWidth - 5, 22);
    
    // Receipt Details
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receipt: ${receiptNumber}`, 5, 27);
    doc.text(`Date: ${new Date(registrationDate).toLocaleDateString('en-IN')}`, 5, 31);
    
    // Event details with styled section header
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 34, pageWidth, 4, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(184, 83, 0);
    doc.text("EVENT DETAILS", pageWidth / 2, 37, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`Event: ${event.title}`, 5, 42);
    doc.text(`Date: ${new Date(event.startTime).toLocaleDateString('en-IN')}`, 5, 46);
    doc.text(`Time: ${new Date(event.startTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`, 5, 50);
    doc.text(`Location: ${event.location || "Church hall"}`, 5, 54);
    
    // Divider line
    doc.setDrawColor(222, 135, 4);
    doc.setLineWidth(0.2);
    doc.line(5, 57, pageWidth - 5, 57);
    
    // Registration details with styled section header
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 59, pageWidth, 4, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(184, 83, 0);
    doc.text("REGISTRATION DETAILS", pageWidth / 2, 62, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    
    // Determine if it's family or individual registration
    const isGroupRegistration = registrations.length > 1;
    const registrationType = isGroupRegistration ? 'Group' : 'Individual';
    doc.text(`Type: ${registrationType} Registration`, 5, 67);
    
    // Create styled table for registration details
    let yPos = 72;
    
    // Draw table header with background
    doc.setFillColor(255, 248, 230); 
    doc.rect(5, yPos, pageWidth - 10, 7, 'F');
    doc.setDrawColor(222, 135, 4);
    doc.rect(5, yPos, pageWidth - 10, 7, 'S');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(184, 83, 0);
    doc.text("Description", 7, yPos + 5);
    doc.text("Amount", pageWidth - 7, yPos + 5, { align: 'right' });
    
    yPos += 9;
    
    // Draw table content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    
    // Registration summary
    doc.text(`${registrations.length} Person(s) Registration`, 7, yPos);
    doc.text(`Rs ${totalFees}`, pageWidth - 7, yPos, { align: 'right' });
    yPos += 5;
    
    // Fee breakdown
    doc.text(`@ Rs ${event.registrationFees} per person`, 7, yPos);
    yPos += 7;
    
    // Registered persons header
    doc.setFillColor(245, 245, 245);
    doc.rect(5, yPos - 3, pageWidth - 10, 5, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(184, 83, 0);
    doc.text("Registered Persons", pageWidth / 2, yPos, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    yPos += 5;
    
    // List all registered persons
    registrations.forEach((registration, index) => {
      const parishioner = registration.parishioner;
      doc.text(`${index + 1}. ${parishioner.name}`, 7, yPos);
      doc.text(`Rs ${event.registrationFees}`, pageWidth - 7, yPos, { align: 'right' });
      yPos += 4;
      
      // Add family info if available
      if (parishioner.family && parishioner.family.bccGroup) {
        doc.setFontSize(6);
        doc.setTextColor(120, 120, 120);
        doc.text(`   ${parishioner.family.bccGroup.name}, ${parishioner.family.bccGroup.area}`, 7, yPos);
        yPos += 3;
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
      }
    });
    
    // Total amount with styled background
    yPos += 3;
    doc.setDrawColor(222, 135, 4);
    doc.setLineWidth(0.5);
    doc.line(5, yPos, pageWidth - 5, yPos);
    yPos += 5;
    
    doc.setFillColor(255, 248, 230);
    doc.rect(5, yPos - 4, pageWidth - 10, 6, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(184, 83, 0);
    doc.text("Total Amount:", 7, yPos);
    doc.text(`Rs ${totalFees}`, pageWidth - 7, yPos, { align: 'right' });
    
    yPos += 2;
    doc.setLineWidth(0.5);
    doc.line(5, yPos, pageWidth - 5, yPos);
    
    // Thank you note with styling
    yPos += 7;
    doc.setFillColor(245, 245, 245);
    doc.rect(5, yPos - 4, pageWidth - 10, 10, 'F');
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(184, 83, 0);
    doc.text("Thank you for registering!", pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 4;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("Please present this receipt at the event", pageWidth / 2, yPos, { align: 'center' });
    
    // Footer with contact information
    yPos += 10;
    doc.setFontSize(6);
    doc.text("Phone: +91-XXXXXXXXXX", pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 3;
    doc.text("Email: churchrisenchrist@gmail.com", pageWidth / 2, yPos, { align: 'center' });
    
    // Save PDF
    const fileName = `Receipt-${receiptNumber}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error("Error generating receipt:", error);
    return false;
  }
};