import { jsPDF } from 'jspdf';
// Make sure to import the plugin correctly
import 'jspdf-autotable';

/**
 * Generates a smaller receipt-style PDF for event registration and downloads it
 * @param {Object} data - Receipt data
 */
export const generateReceipt = (data) => {
  try {
    const {
      event,
      registrationType,
      items,
      totalMembers,
      totalAmount,
      receiptId,
      date
    } = data;

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150]
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFont("helvetica");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Saint Mary's Parish", pageWidth / 2, 10, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text("Event Registration Receipt", pageWidth / 2, 15, { align: 'center' });
    
    // Divider line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    doc.line(5, 18, pageWidth - 5, 18);
    
    // Receipt Details
    doc.setFontSize(8);
    doc.text(`Receipt: ${receiptId}`, 5, 23);
    doc.text(`Date: ${new Date(date).toLocaleDateString('en-IN')}`, 5, 27);
    
    // Event details
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text("EVENT DETAILS", pageWidth / 2, 32, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text(`Event: ${event.title}`, 5, 37);
    doc.text(`Date: ${new Date(event.startTime).toLocaleDateString('en-IN')}`, 5, 41);
    doc.text(`Time: ${new Date(event.startTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`, 5, 45);
    doc.text(`Location: ${event.location || "Church hall"}`, 5, 49);
    
    // Divider line
    doc.line(5, 52, pageWidth - 5, 52);
    
    // Registration details
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text("REGISTRATION DETAILS", pageWidth / 2, 57, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text(`Type: ${registrationType === 'family' ? 'Family' : 'Individual'}`, 5, 62);
    
    // Create table data manually instead of using autoTable
    let yPos = 67;
    
    // Draw table header
    doc.setFillColor(240, 240, 240);
    doc.rect(5, yPos, pageWidth - 10, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Description", 7, yPos + 5);
    doc.text("Amount", pageWidth - 7, yPos + 5, { align: 'right' });
    
    yPos += 9;
    
    // Draw table content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    
    if (registrationType === 'family') {
      const family = items[0];
      
      // Family head row
      doc.text(`${family.headOfFamily || "Unknown"} Family`, 7, yPos);
      doc.text(`${family.memberCount || totalMembers}`, pageWidth - 7, yPos, { align: 'right' });
      yPos += 5;
      
      // Fee row
      doc.text(`@ Rs. ${event.registrationFees} per person`, 7, yPos);
      doc.text(`Rs. ${totalAmount}`, pageWidth - 7, yPos, { align: 'right' });
      yPos += 7;
      
      // Members header
      doc.setFont("helvetica", "bold");
      doc.text("----- Family Members -----", pageWidth / 2, yPos, { align: 'center' });
      doc.setFont("helvetica", "normal");
      yPos += 5;
      
      // Try to get members from all possible sources
      let membersList = [];
      
      if (family.parishioners && Array.isArray(family.parishioners)) {
        membersList = family.parishioners;
      } else if (family.members && Array.isArray(family.members)) {
        membersList = family.members;
      } else if (family.family && family.family.members && Array.isArray(family.family.members)) {
        membersList = family.family.members;
      }
      
      // Show member names
      if (membersList && membersList.length > 0) {
        membersList.forEach((member, index) => {
          doc.text(`${index + 1}. ${member.name || `Member ${index+1}`}`, 7, yPos);
          yPos += 4;
        });
      } else {
        doc.text(`Total: ${family.memberCount || totalMembers} family members`, 7, yPos);
        yPos += 4;
      }
    } else {
      // For individuals
      doc.text(`${items.length} Person(s)`, 7, yPos);
      yPos += 7;
      
      // Add individual names
      items.forEach((person, index) => {
        doc.text(`${index + 1}. ${person.name || `Person ${person.id}`}`, 7, yPos);
        doc.text(`Rs. ${event.registrationFees}`, pageWidth - 7, yPos, { align: 'right' });
        yPos += 4;
      });
    }
    
    // Total amount
    yPos += 3;
    doc.line(5, yPos, pageWidth - 5, yPos);
    yPos += 5;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 7, yPos);
    doc.text(`Rs. ${totalAmount}`, pageWidth - 7, yPos, { align: 'right' });
    
    yPos += 2;
    doc.line(5, yPos, pageWidth - 5, yPos);
    
    // Thank you note
    yPos += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for registering!", pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 4;
    doc.setFontSize(7);
    doc.text("Please present this receipt at the event", pageWidth / 2, yPos, { align: 'center' });
    
    // Footer
    yPos += 6;
    doc.setFontSize(6);
    doc.text("Phone: +91 98765 43210", pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 3;
    doc.text("Email: contact@saintmarys.org", pageWidth / 2, yPos, { align: 'center' });
    
    // Save PDF
    const fileName = `Receipt-${receiptId}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error("Error generating receipt:", error);
    return false;
  }
};