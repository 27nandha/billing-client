import PDFDocument from "pdfkit";

export const generateBillPdf = (res, bill, client, servicesList) => {
  const doc = new PDFDocument({ margin: 40 });

  doc.pipe(res);

  // Header
  doc
    .fontSize(20)
    .text("Your Company Name", { align: "center" })
    .moveDown(0.5)
    .fontSize(10)
    .text("Your Company Address", { align: "center" })
    .text("Phone: +91-1234567890 | Email: company@email.com", {
      align: "center",
    })
    .moveDown(1);

  // Bill Title
  doc.fontSize(16).text("Invoice / Bill", { align: "center" }).moveDown(1);

  // Client Details
  doc
    .fontSize(12)
    .text(`Client: ${client.name}`)
    .text(`Email: ${client.email}`)
    .text(`Phone: ${client.phone}`)
    .moveDown(1);

  // Table Header
  const tableTop = doc.y;
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Service", 50, tableTop)
    .text("Quantity", 250, tableTop)
    .text("Price", 320, tableTop)
    .text("Subtotal", 400, tableTop);

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Table Rows
  let y = tableTop + 25;
  let total = 0;
  doc.font("Helvetica").fontSize(10);

  bill.services.forEach(({ service, quantity }) => {
    const serviceId = service._id ? service._id.toString() : service.toString();
    const srv = servicesList.find((s) => s._id.toString() === serviceId);
    const price = srv?.price || 0;
    const subtotal = price * quantity;
    total += subtotal;

    doc.text(srv?.name || "Unknown", 50, y, { width: 180 });
    doc.text(quantity.toString(), 250, y, { width: 50, align: "right" });
    doc.text(`INR ${price}`, 320, y, { width: 60, align: "right" });
    doc.text(`INR ${subtotal}`, 400, y, { width: 80, align: "right" });

    y += 20;
  });

  // Total
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(`Total: INR ${total}`, 400, y + 10);

  // Footer
  doc
    .font("Helvetica")
    .fontSize(10)
    .moveDown(2)
    .text("Thank you for your business!", { align: "center" })
    .text("Generated on: " + new Date().toLocaleDateString(), {
      align: "center",
    });

  doc.end();
};
