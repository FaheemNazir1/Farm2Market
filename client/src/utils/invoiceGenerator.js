import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Verify autoTable is available after import
console.log('jsPDF version:', jsPDF.version);
console.log('autoTable available:', typeof jsPDF.API.autoTable);

// Test function to verify jsPDF is working
export const testPDFGeneration = () => {
  try {
    console.log('Testing PDF generation...');
    const doc = new jsPDF();
    
    // Test basic text
    doc.text('Test PDF Generation', 20, 20);
    
    // Test autoTable function
    if (typeof doc.autoTable === 'function') {
      console.log('autoTable function is available');
      doc.autoTable({
        startY: 30,
        head: [['Test Column 1', 'Test Column 2']],
        body: [['Test Data 1', 'Test Data 2']],
      });
      console.log('autoTable test successful');
    } else {
      console.error('autoTable function is NOT available on doc object');
      console.log('Available methods on doc:', Object.getOwnPropertyNames(doc));
      return false;
    }
    
    const blob = doc.output('blob');
    console.log('PDF test successful, blob size:', blob.size);
    return true;
  } catch (error) {
    console.error('PDF test failed:', error);
    return false;
  }
};

export const generateInvoice = (order) => {
  try {
    // Validate order data
    if (!order) {
      throw new Error('Order data is required');
    }
    
    if (!order.orderNumber) {
      throw new Error('Order number is missing');
    }
    
    if (!order.items || order.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    
    if (!order.shippingAddress) {
      throw new Error('Shipping address is required');
    }

    const doc = new jsPDF();
  
  // Company Information
  const companyName = 'Farm2Market';
  const companyAddress = 'Digital Agriculture Platform\nIndia';
  
  // Invoice Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyAddress, 20, 35);
  
  // Invoice Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 150, 25);
  
  // Invoice Details (Top Right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${order.orderNumber}`, 150, 35);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 150, 42);
  doc.text(`Status: ${order.status.toUpperCase()}`, 150, 49);
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 55, 190, 55);
  
  // Customer Information
  let yPosition = 65;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, yPosition);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition += 7;
  doc.text(order.shippingAddress.name, 20, yPosition);
  yPosition += 5;
  doc.text(order.shippingAddress.street, 20, yPosition);
  yPosition += 5;
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, 20, yPosition);
  yPosition += 5;
  doc.text(order.shippingAddress.pincode, 20, yPosition);
  
  // Farmer Information
  yPosition = 65;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Sold By:', 120, yPosition);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition += 7;
  doc.text(order.farmer?.name || 'Farm2Market Farmer', 120, yPosition);
  yPosition += 5;
  doc.text(order.farmer?.email || 'farmer@farm2market.com', 120, yPosition);
  yPosition += 5;
  doc.text(order.farmer?.phone || '+91 XXXXXXXXXX', 120, yPosition);
  
  // Items Table
  const tableData = order.items.map((item, index) => [
    index + 1,
    item.crop.name,
    item.crop.variety || '-',
    `${item.quantity} ${item.crop.quantity?.unit || 'kg'}`,
    `₹${item.unitPrice.toLocaleString('en-IN')}`,
    `₹${item.totalPrice.toLocaleString('en-IN')}`
  ]);
  
  doc.autoTable({
    startY: 110,
    head: [['#', 'Product', 'Variety', 'Quantity', 'Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 197, 94], // Green color
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 30 }
    }
  });
  
  // Calculate position after table
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Summary Section
  const summaryX = 130;
  let summaryY = finalY;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  doc.text('Subtotal:', summaryX, summaryY);
  doc.text(`₹${order.totalAmount.toLocaleString('en-IN')}`, 175, summaryY, { align: 'right' });
  summaryY += 7;
  
  // Delivery Charges
  doc.text('Delivery Charges:', summaryX, summaryY);
  const deliveryText = order.deliveryCharges > 0 ? `₹${order.deliveryCharges.toLocaleString('en-IN')}` : 'Free';
  doc.text(deliveryText, 175, summaryY, { align: 'right' });
  summaryY += 7;
  
  // Tax
  doc.text('Tax (5%):', summaryX, summaryY);
  doc.text(`₹${order.taxAmount.toLocaleString('en-IN')}`, 175, summaryY, { align: 'right' });
  summaryY += 7;
  
  // Line above total
  doc.setLineWidth(0.3);
  doc.line(summaryX, summaryY, 190, summaryY);
  summaryY += 5;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Amount:', summaryX, summaryY);
  doc.text(`₹${order.finalAmount.toLocaleString('en-IN')}`, 175, summaryY, { align: 'right' });
  
  // Payment Information
  summaryY += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Information:', 20, summaryY);
  
  doc.setFont('helvetica', 'normal');
  summaryY += 7;
  doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 20, summaryY);
  summaryY += 5;
  doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 20, summaryY);
  
  if (order.paymentId) {
    summaryY += 5;
    doc.text(`Transaction ID: ${order.paymentId}`, 20, summaryY);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for choosing Farm2Market - Connecting Farmers Directly to You', 105, pageHeight - 20, { align: 'center' });
  doc.text('This is a digitally generated invoice.', 105, pageHeight - 15, { align: 'center' });
  
  // Notes section if there are any notes
  if (order.notes && (order.notes.buyer || order.notes.farmer)) {
    summaryY += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, summaryY);
    
    doc.setFont('helvetica', 'normal');
    summaryY += 7;
    if (order.notes.buyer) {
      doc.text(`Buyer: ${order.notes.buyer}`, 20, summaryY);
      summaryY += 5;
    }
    if (order.notes.farmer) {
      doc.text(`Farmer: ${order.notes.farmer}`, 20, summaryY);
    }
  }
  
  return doc;
  } catch (error) {
    console.error('Error in generateInvoice:', error);
    throw error;
  }
};

export const downloadInvoice = (order) => {
  try {
    console.log('Starting invoice download for order:', order);
    
    if (!order) {
      throw new Error('Order data is required for invoice generation');
    }
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Invoice download requires a browser environment');
    }
    
    // Check if browser supports blob downloads
    if (!window.URL || !window.URL.createObjectURL) {
      throw new Error('Your browser does not support file downloads. Please update your browser.');
    }
    
    console.log('Generating PDF document...');
    const doc = generateInvoice(order);
    
    if (!doc) {
      throw new Error('Failed to generate PDF document');
    }
    
    console.log('PDF generated successfully, initiating download...');
    
    const fileName = `Invoice_${order.orderNumber || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Try to save the file
    try {
      doc.save(fileName);
      console.log('Download initiated successfully');
      return { success: true };
    } catch (saveError) {
      console.error('Download save error:', saveError);
      
      // Try alternative download method
      try {
        const pdfBlob = doc.output('blob');
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('Alternative download method successful');
        return { success: true };
      } catch (altError) {
        console.error('Alternative download method failed:', altError);
        throw new Error(`Download failed: ${altError.message}. Please check your browser's download settings.`);
      }
    }
    
  } catch (error) {
    console.error('Error in downloadInvoice:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred during invoice generation'
    };
  }
};