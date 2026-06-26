import Contact from "../models/Contact.js";
import transporter from "../config/mail.js";

// ======================================================
// CREATE CONTACT
// ======================================================

export const createContact = async (req, res) => {
  try {
    const { fullName, email, phone, company, message } = req.body;

    if (!fullName || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required.",
      });
    }

    // Save Contact
    const contact = await Contact.create({
      fullName,
      email,
      phone,
      company,
      message,
    });

    // ==========================
    // Send Mail to Admin
    // ==========================

    if (process.env.OWNER_EMAIL) {
      await transporter.sendMail({
        from: `"Visezy" <${process.env.SMTP_EMAIL}>`,
        to: process.env.OWNER_EMAIL,
        subject: "New Contact Form Submission",

        html: `
          <h2>New Contact Request</h2>

          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Company:</strong> ${company || "N/A"}</p>

          <hr>

          <p>${message}</p>
        `,
      });
    }

    // ==========================
    // Auto Reply
    // ==========================

    await transporter.sendMail({
      from: `"Visezy" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Thank you for contacting Visezy",

      html: `
        <h2>Hello ${fullName},</h2>

        <p>Thank you for contacting Visezy.</p>

        <p>
          We have received your enquiry successfully.
          Our team will get back to you as soon as possible.
        </p>

        <br>

        <p>Regards,</p>

        <strong>Visezy Team</strong>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Contact submitted successfully.",
      contact,
    });

  } catch (error) {
    console.error("Create Contact Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/* ============================================================
   GET ALL CONTACTS
============================================================ */

export const getContacts = async (req, res) => {

    try {

        const contacts = await Contact.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            total: contacts.length,
            contacts,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

/* ============================================================
   GET SINGLE CONTACT
============================================================ */

export const getContact = async (req, res) => {

    try {

        const contact = await Contact.findById(req.params.id);

        if (!contact) {

            return res.status(404).json({
                success: false,
                message: "Contact not found",
            });

        }

        res.json({
            success: true,
            contact,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

/* ============================================================
   MARK AS READ
============================================================ */

export const markAsRead = async (req, res) => {
  console.log("PATCH HIT");
  console.log(req.params.id);

  try {
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================================================
   DELETE CONTACT
============================================================ */

export const deleteContact = async (req, res) => {

    try {

        const contact = await Contact.findById(req.params.id);

        if (!contact) {

            return res.status(404).json({
                success: false,
                message: "Contact not found.",
            });

        }

        await contact.deleteOne();

        res.json({
            success: true,
            message: "Contact deleted successfully.",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// ======================================================
// SEND EMAIL TO CONTACT
// ======================================================

export const sendReply = async (req, res) => {
    try {
        const {
            email,
            subject,
            message,
        } = req.body;

        if (!email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Email, subject and message are required.",
            });
        }

        await transporter.sendMail({
            from: `"Visezy" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject,

            html: `
                <!DOCTYPE html>

                <html>

                <head>
                    <style>
                        body{
                            font-family:Arial;
                            background:#f8fafc;
                            padding:40px;
                        }

                        .card{
                            max-width:650px;
                            margin:auto;
                            background:#fff;
                            border-radius:12px;
                            overflow:hidden;
                            box-shadow:0 10px 30px rgba(0,0,0,.08);
                        }

                        .header{
                            background:#2563eb;
                            color:white;
                            padding:25px;
                            font-size:22px;
                            font-weight:bold;
                        }

                        .content{
                            padding:30px;
                            color:#374151;
                            line-height:1.8;
                        }

                        .footer{
                            padding:20px;
                            background:#f1f5f9;
                            text-align:center;
                            color:#64748b;
                            font-size:14px;
                        }
                    </style>
                </head>

                <body>

                    <div class="card">

                        <div class="header">
                            Visezy
                        </div>

                        <div class="content">

                            ${message}

                            <br><br>

                            Regards,

                            <br>

                            <strong>Visezy Team</strong>

                        </div>

                        <div class="footer">

                            © ${new Date().getFullYear()} Visezy

                        </div>

                    </div>

                </body>

                </html>
            `,
        });

        res.json({
            success: true,
            message: "Email sent successfully.",
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Unable to send email.",
        });
    }
};
