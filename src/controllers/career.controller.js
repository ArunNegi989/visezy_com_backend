import fs from "fs";
import Career from "../models/Career.js";
import transporter from "../config/mail.js";

// ======================================================
// CREATE CAREER APPLICATION
// ======================================================

export const createCareer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      currentPosition,
      experience,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !currentPosition ||
      !experience
    ) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume is required.",
      });
    }

    // ==========================
    // Save Application
    // ==========================

    const career = await Career.create({
      firstName,
      lastName,
      email,
      phone,
      currentPosition,
      experience,

      resume: `/uploads/careers/${req.file.filename}`,

      resumeOriginalName: req.file.originalname,
    });

    // ==========================
    // Send Mail To Admin
    // ==========================

    if (process.env.OWNER_EMAIL) {
      await transporter.sendMail({
        from: `"Visezy Careers" <${process.env.SMTP_EMAIL}>`,
        to: process.env.OWNER_EMAIL,
        subject: `New Career Application - ${firstName} ${lastName}`,

        html: `
          <h2>New Career Application</h2>

          <table cellpadding="8">
            <tr>
              <td><strong>Name</strong></td>
              <td>${firstName} ${lastName}</td>
            </tr>

            <tr>
              <td><strong>Email</strong></td>
              <td>${email}</td>
            </tr>

            <tr>
              <td><strong>Phone</strong></td>
              <td>${phone}</td>
            </tr>

            <tr>
              <td><strong>Current Position</strong></td>
              <td>${currentPosition}</td>
            </tr>

            <tr>
              <td><strong>Experience</strong></td>
              <td>${experience}</td>
            </tr>
          </table>

          <br>

          <strong>Resume:</strong>

          <br>

          <a href="${process.env.BASE_URL}${career.resume}">
            Download Resume
          </a>
        `,
      });
    }

    // ==========================
    // Auto Reply
    // ==========================

    await transporter.sendMail({
      from: `"Visezy Careers" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Application Received",

      html: `
        <h2>Hello ${firstName},</h2>

        <p>
          Thank you for applying at <strong>Visezy</strong>.
        </p>

        <p>
          We have successfully received your application.
        </p>

        <p>
          Our hiring team will review your profile and
          contact you if your profile matches our
          requirements.
        </p>

        <br>

        <strong>Regards</strong>

        <br>

        Visezy HR Team
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      career,
    });
  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================================
// GET ALL CAREER APPLICATIONS
// ======================================================

export const getCareers = async (req, res) => {
  try {
    const careers = await Career.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      total: careers.length,
      careers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET SINGLE CAREER
// ======================================================

export const getCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);

    if (!career) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    career.isRead = true;
    await career.save();

    res.json({
      success: true,
      career,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE STATUS
// ======================================================

export const updateCareerStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const career =
      await Career.findByIdAndUpdate(
        req.params.id,
        {
          status,
        },
        {
          new: true,
        }
      );

    if (!career) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.json({
      success: true,
      message: "Status updated.",
      career,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// DELETE APPLICATION
// ======================================================

export const deleteCareer = async (
  req,
  res
) => {
  try {
    const career =
      await Career.findById(req.params.id);

    if (!career) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    const resumePath =
      `src${career.resume}`;

    if (
      fs.existsSync(resumePath)
    ) {
      fs.unlinkSync(resumePath);
    }

    await career.deleteOne();

    res.json({
      success: true,
      message:
        "Application deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// SEND EMAIL
// ======================================================

export const sendCareerReply =
  async (req, res) => {
    try {
      const {
        email,
        subject,
        message,
      } = req.body;

      if (
        !email ||
        !subject ||
        !message
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email, subject and message are required.",
        });
      }

      await transporter.sendMail({
        from: `"Visezy Careers" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject,

        html: `
          <!DOCTYPE html>

          <html>

          <body style="font-family:Arial;background:#f8fafc;padding:30px;">

            <div style="max-width:650px;margin:auto;background:#fff;border-radius:12px;padding:30px;box-shadow:0 10px 30px rgba(0,0,0,.08)">

              <h2 style="color:#2563eb;">
                Visezy Careers
              </h2>

              <div style="line-height:1.8;color:#374151;">
                ${message}
              </div>

              <br>

              <strong>
                Regards,
              </strong>

              <br>

              Visezy HR Team

            </div>

          </body>

          </html>
        `,
      });

      res.json({
        success: true,
        message:
          "Email sent successfully.",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Unable to send email.",
      });
    }
  };