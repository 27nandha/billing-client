import PDFDocument from "pdfkit";

export const generateBillPdf = (res, bill, client, servicesList) => {
  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  // Company Header
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Redback IT Solutions Pvt Ltd.", { align: "center" })
    .font("Helvetica")
    .fontSize(10)
    .text("AL-24, THHB, Phase-3, Sathuvachari, Vellore-09", { align: "center" })
    .text("Phone: 0416-2252688 | Cell: 8189985558", { align: "center" })
    .text("Email: support@redbacks.in", { align: "center" });

  // Line below header
  doc.moveTo(40, 100).lineTo(570, 100).lineWidth(1).stroke();

  // INVOICE Title
  doc.font("Helvetica-Bold").fontSize(14).text("INVOICE", 50, 110);

  // Client and Invoice Info (Side-by-Side)
  const topY = 135;

  // Bill To
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Bill To:", 50, topY)
    .font("Helvetica")
    .fontSize(10)
    .text(client.name, 50, topY + 15)
    .text(client.email, 50, topY + 30)
    .text(client.phone, 50, topY + 45);

  // Invoice Info
  doc
    .font("Helvetica")
    .text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 370, topY)
    .text(`Invoice #: ${bill.invoiceId}`, 370, topY + 15)
    .text(`Status: ${bill.status}`, 370, topY + 30);

  // Table Headers
  const tableTop = topY + 80;
  const itemX = {
    sno: 50,
    name: 90,
    qty: 300,
    unit: 370,
    total: 460,
  };

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("S.No", itemX.sno, tableTop)
    .text("Item", itemX.name, tableTop)
    .text("Qty", itemX.qty, tableTop)
    .text("Unit Price", itemX.unit, tableTop)
    .text("Total", itemX.total, tableTop);

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Table Rows
  let y = tableTop + 25;
  let subtotal = 0;

  bill.services.forEach(({ service, quantity }, idx) => {
    const serviceId = service._id?.toString() || service.toString();
    const srv = servicesList.find((s) => s._id.toString() === serviceId);
    const price = srv?.price || 0;
    const total = price * quantity;
    subtotal += total;

    // Alternate background
    if (idx % 2 === 0) {
      doc
        .rect(50, y - 2, 500, 18)
        .fill("#f9f9f9")
        .fillColor("black");
    }

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("black")
      .text(idx + 1, itemX.sno, y)
      .text(srv?.name || "Unknown", itemX.name, y)
      .text(quantity.toString(), itemX.qty, y)
      .text(`Rs.${price.toFixed(2)}`, itemX.unit, y)
      .text(`Rs.${total.toFixed(2)}`, itemX.total, y);

    y += 20;
  });

  doc.moveTo(50, y).lineTo(550, y).stroke();
  y += 10;

  // Totals
  const taxRate = bill.taxRate || 18;
  const taxAmount = bill.taxAmount || (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  doc
    .font("Helvetica-Bold")
    .text("Subtotal", itemX.unit, y)
    .text(`Rs.${subtotal.toFixed(2)}`, itemX.total, y);

  y += 15;
  doc
    .font("Helvetica")
    .text(`GST (${taxRate}%)`, itemX.unit, y)
    .text(`Rs.${taxAmount.toFixed(2)}`, itemX.total, y);

  y += 15;
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Grand Total", itemX.unit, y)
    .text(`Rs.${grandTotal.toFixed(2)}`, itemX.total, y);

  // Terms & Conditions
  y += 40;
  doc.font("Helvetica-Bold").fontSize(9).text("Terms & Conditions:", 50, y);

  doc
    .font("Helvetica")
    .fontSize(9)
    .text("1. Goods once sold cannot be taken back or exchanged.", 50, y + 15)
    .text("2. Once invoice made, cannot be modified or cancelled.", 50, y + 27)
    .text("3. Warranty must be claimed from manufacturer only.", 50, y + 39)
    .text(
      "4. Physical damage / burnt components / mishandling voids warranty.",
      50,
      y + 51
    )
    .text("5. Inclusive of all taxes.", 50, y + 63);

  // Signature
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Authorized Signature", 400, y + 100);
  // .moveTo(400, y + 120)
  // .lineTo(550, y + 120)
  // .stroke();

  // Footer
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Thank you for your business!", 50, y + 150, { align: "center" });

  doc.end();
};
