import PDFDocument from "pdfkit";

export const generateBillPdf = (
  res,
  bill,
  client,
  servicesList,
  subcompany,
  bank
) => {
  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  // === Header Section ===
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(subcompany?.name || "Company Name", { align: "center" })
    .font("Helvetica")
    .fontSize(10)
    .text(subcompany?.address || "", { align: "center" })
    .text(
      `GST: ${subcompany?.gstNumber || "N/A"} | Phone: ${
        subcompany?.phone || "N/A"
      }`,
      { align: "center" }
    )
    .text(`Email: ${subcompany?.email || "N/A"}`, { align: "center" });

  doc.moveDown(1);
  doc.moveTo(40, doc.y).lineTo(570, doc.y).stroke();

  // === Invoice Title ===
  const heading = bill.type === "quotation" ? "QUOTATION" : "INVOICE";
  doc
    .moveDown(1)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(heading, { align: "center" });

  // === Client & Invoice Info ===
  const topY = doc.y + 20;

  // Left Column - Bill To
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Bill To:", 50, topY)
    .font("Helvetica")
    .text(client.name, 50, topY + 15)
    .text(client.email, 50, topY + 30)
    .text(client.phone, 50, topY + 45);

  // Right Column - Invoice Info
  doc
    .font("Helvetica")
    .text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 370, topY)
    .text(`Invoice #: ${bill.invoiceId}`, 370, topY + 15)
    .text(`Status: ${bill.status}`, 370, topY + 30);

  // === Table Header ===
  const tableTop = topY + 80;
  const itemX = {
    sno: 50,
    name: 80,
    description: 220,
    qty: 370,
    unit: 420,
    total: 500,
  };
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("S.No", itemX.sno, tableTop)
    .text("Item", itemX.name, tableTop)
    .text("Description", itemX.description, tableTop)
    .text("Qty", itemX.qty, tableTop)
    .text("Unit Price", itemX.unit, tableTop)
    .text("Total", itemX.total, tableTop);

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(570, tableTop + 15)
    .stroke();

  // === Table Rows ===
  let y = tableTop + 25;
  let subtotal = 0;

  bill.services.forEach(({ service, quantity, unitPrice, name }, idx) => {
    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const total = price * qty;
    subtotal += total;

    const matchingService = servicesList.find(
      (s) => s._id.toString() === (service._id || service).toString()
    );
    const description = matchingService?.description || "-";

    // Alternate row color
    if (idx % 2 === 0) {
      doc.fillColor("black");
    }

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("black")
      .text(idx + 1, itemX.sno, y)
      .text(name || "Unknown", itemX.name, y, {
        width: itemX.description - itemX.name - 5,
      })
      .text(description, itemX.description, y, {
        width: itemX.qty - itemX.description - 5,
      })
      .text(quantity.toString(), itemX.qty, y)
      .text(`Rs.${price.toFixed(2)}`, itemX.unit, y)
      .text(`Rs.${total.toFixed(2)}`, itemX.total, y);

    y += 20;
  });

  doc.moveTo(50, y).lineTo(550, y).stroke();
  y += 10;

  // === Totals Section ===
  const sgst = bill.sgstRate || 0;
  const cgst = bill.cgstRate || 0;
  const igst = bill.igstRate || 0;

  const sgstAmount = bill.sgstAmount || (subtotal * sgst) / 100;
  const cgstAmount = bill.cgstAmount || (subtotal * cgst) / 100;
  const igstAmount = bill.igstAmount || (subtotal * igst) / 100;

  const taxAmount = sgstAmount + cgstAmount + igstAmount;
  const grandTotal = subtotal + taxAmount;

  doc
    .font("Helvetica-Bold")
    .text("Subtotal", itemX.unit, y)
    .text(`Rs.${subtotal.toFixed(2)}`, itemX.total, y);

  y += 15;

  // Always show SGST
  doc
    .font("Helvetica")
    .text(`SGST (${sgst}%)`, itemX.unit, y)
    .text(`Rs.${sgst > 0 ? sgstAmount.toFixed(2) : "0.00"}`, itemX.total, y);
  y += 15;

  // Always show CGST
  doc
    .font("Helvetica")
    .text(`CGST (${cgst}%)`, itemX.unit, y)
    .text(`Rs.${cgst > 0 ? cgstAmount.toFixed(2) : "0.00"}`, itemX.total, y);
  y += 15;

  // Always show IGST
  doc
    .font("Helvetica")
    .text(`IGST (${igst}%)`, itemX.unit, y)
    .text(`Rs.${igst > 0 ? igstAmount.toFixed(2) : "0.00"}`, itemX.total, y);
  y += 15;

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Grand Total", itemX.unit, y)
    .text(`Rs.${grandTotal.toFixed(2)}`, itemX.total, y);

  // === Terms & Conditions ===
  y += 40;
  doc.font("Helvetica-Bold").fontSize(9).text("Terms & Conditions:", 50, y);
  const terms =
    bill.type === "quotation"
      ? [
          "Quotation once made, cannot be modified or cancelled.",
          "The Payment Terms: 100% in advance.",
          "This Quotation is Valid for 5 Days Only.",
          "Payment to be made in favor of Redback IT Solutions Pvt Ltd.",
        ]
      : [
          "Goods once sold cannot be taken back or exchanged.",
          "Once invoice is made, it cannot be modified or cancelled.",
          "Warranty must be claimed from manufacturer only.",
          "Physical damage / burnt components / mishandling voids warranty.",
          "Inclusive of all taxes.",
        ];

  doc
    .font("Helvetica")
    .fontSize(9)
    .list(terms, 60, y + 15);

  // === Bank Details Section ===
  y += 15 + terms.length * 15 + 10; // Adjust Y based on terms length

  doc.font("Helvetica-Bold").fontSize(9).text("Bank Details:", 50, y);

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(`Account Holder: ${bank?.accountHolder || "N/A"}`, 60, y + 15)
    .text(`Account Number: ${bank?.accountNumber || "N/A"}`, 60, y + 30)
    .text(`Bank Name: ${bank?.bankName || "N/A"}`, 60, y + 45)
    .text(`Branch: ${bank?.branch || "N/A"}`, 60, y + 60)
    .text(`IFSC Code: ${bank?.ifscCode || "N/A"}`, 60, y + 75);

  // === Signature Section ===
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Authorized Signature", 400, y + 100);

  // === Footer Message ===
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Thank you for your business!", 50, y + 150, { align: "center" });

  doc.end();
};
