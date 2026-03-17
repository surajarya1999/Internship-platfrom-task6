const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "EXISTS" : "MISSING");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 👇 YAHAN LAGAO (IMPORTANT)
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP READY");
  }
});

const PLAN_INFO = {
  bronze: { name: "Bronze Plan", price: 100, limit: "3 internships/month" },
  silver: { name: "Silver Plan", price: 300, limit: "5 internships/month" },
  gold: { name: "Gold Plan", price: 1000, limit: "Unlimited internships" },
};

const sendInvoiceEmail = async ({ name, email, plan, amount, invoiceNumber, paymentId }) => {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "EXISTS" : "MISSING");
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
  const p = PLAN_INFO[plan];
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:20px;background:#0a0a0f;font-family:'Segoe UI',sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#13131e;border:1px solid rgba(99,102,241,0.2);border-radius:20px;overflow:hidden;">
      
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px;text-align:center;">
        <div style="font-size:40px;margin-bottom:10px;">🎉</div>
        <h1 style="color:white;margin:0;font-size:26px;font-weight:800;">Payment Successful!</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Your plan has been activated</p>
      </div>

      <div style="padding:32px;">
        <p style="color:#94a3b8;margin:0 0 24px;font-size:15px;">Hi <strong style="color:#e2e8f0">${name}</strong>, thank you for subscribing to InternshipHub!</p>

        <div style="background:#0d0d18;border:1px solid rgba(99,102,241,0.12);border-radius:14px;padding:24px;margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">INVOICE</span>
            <span style="color:#818cf8;font-size:13px;font-weight:700;">#${invoiceNumber}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#94a3b8;font-size:13px;padding:7px 0;">Plan</td><td style="color:#e2e8f0;font-size:13px;font-weight:600;text-align:right;">${p.name}</td></tr>
            <tr><td style="color:#94a3b8;font-size:13px;padding:7px 0;">Limit</td><td style="color:#e2e8f0;font-size:13px;font-weight:600;text-align:right;">${p.limit}</td></tr>
            <tr><td style="color:#94a3b8;font-size:13px;padding:7px 0;">Date</td><td style="color:#e2e8f0;font-size:13px;text-align:right;">${date}</td></tr>
            <tr><td style="color:#94a3b8;font-size:13px;padding:7px 0;">Payment ID</td><td style="color:#64748b;font-size:11px;font-family:monospace;text-align:right;">${paymentId}</td></tr>
            <tr style="border-top:1px solid rgba(255,255,255,0.06);">
              <td style="color:#e2e8f0;font-size:17px;font-weight:800;padding:14px 0 0;">Total Paid</td>
              <td style="color:#34d399;font-size:22px;font-weight:800;text-align:right;padding-top:14px;">₹${amount}</td>
            </tr>
          </table>
        </div>

        <div style="background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1));border:1px solid rgba(99,102,241,0.25);border-radius:14px;padding:20px;text-align:center;">
          <p style="color:#818cf8;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Active Plan</p>
          <p style="color:#e2e8f0;font-size:24px;font-weight:800;margin:0;">${p.name} ✨</p>
          <p style="color:#94a3b8;font-size:13px;margin:8px 0 0;">You can now apply for <strong style="color:#34d399">${p.limit}</strong></p>
        </div>
      </div>

      <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
        <p style="color:#64748b;font-size:11px;margin:0;">© ${new Date().getFullYear()} InternshipHub · All rights reserved</p>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    // from: `"InternshipHub" <${process.env.EMAIL_USER}>`,
    from: `"InternshipHub" <${process.env.EMAIL_FROM}>`,
    to: email,  // Jo bhi user ne enter kiya
    subject: `✅ Invoice #${invoiceNumber} — ${p.name} Activated`,
    html,
  });

  console.log(`📧 Invoice sent to ${email}`);
};

module.exports = { sendInvoiceEmail };