const nodemailer = require("nodemailer");

/**

 * @param {Object} emailData 
 * @returns {Promise} 
 */
const sendConnectionEmail = async (emailData) => {
  try {
    // just log the email (development mode)
    console.log("=== EMAIL TO BE SENT ===");
    console.log("To:", emailData.to);
    console.log("Subject:", emailData.subject);
    console.log("Body:", emailData.body);
    console.log("=========================");

    return { success: true, message: "Email logged (development mode)" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**

 * @param {Object} sender 
 * @param {Object} recipient
 * @param {String} message 
 * @returns {Object}
 */
const formatConnectionEmail = (sender, recipient, message) => {
  const defaultMessage = "Hey! I'd love to connect and study together!";
  const userMessage = message || defaultMessage;

  return {
    to: recipient.email,
    subject: `Study Buddy Connection Request from ${sender.firstName} ${sender.lastName}`,
    body: `
Hi ${recipient.firstName},

${sender.firstName} ${sender.lastName} wants to connect with you on HelpMate!

${sender.firstName}'s Details:
- University: ${sender.university || "Not specified"}
- Major: ${sender.major || "Not specified"}

Message from ${sender.firstName}:
"${userMessage}"

Log in to HelpMate to view their profile and respond to this connection request.

Best regards,
The HelpMate Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">New Connection Request!</h2>
        <p>Hi ${recipient.firstName},</p>
        <p><strong>${sender.firstName} ${
      sender.lastName
    }</strong> wants to connect with you on HelpMate!</p>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #334155;">${
            sender.firstName
          }'s Details:</h3>
          <p><strong>University:</strong> ${
            sender.university || "Not specified"
          }</p>
          <p><strong>Major:</strong> ${sender.major || "Not specified"}</p>
        </div>

        <div style="background: #ecfeff; padding: 20px; border-left: 4px solid #0d9488; margin: 20px 0;">
          <p style="margin: 0;"><strong>Message from ${
            sender.firstName
          }:</strong></p>
          <p style="margin: 10px 0 0 0; font-style: italic;">"${userMessage}"</p>
        </div>

        <p>Log in to HelpMate to view their profile and respond to this connection request.</p>
        
        <p style="color: #64748b; margin-top: 30px;">
          Best regards,<br>
          The HelpMate Team
        </p>
      </div>
    `,
  };
};

module.exports = {
  sendConnectionEmail,
  formatConnectionEmail,
};
