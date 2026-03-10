const emailTemplate = (name, verificationLink) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
  </head>

  <body style="font-family: Arial; background:#f4f4f4; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px;">

      <h2 style="color:#333;">Welcome ${name} 👋</h2>

      <p>
        Thank you for registering. Please verify your email address to activate your account.
      </p>

      <div style="text-align:center; margin:30px 0;">
        <a href="${verificationLink}" 
           style="background:#4CAF50; color:white; padding:12px 25px; text-decoration:none; border-radius:5px;">
           Verify Email
        </a>
      </div>

      <p>If the button does not work, copy and paste this link:</p>

      <p style="word-break:break-all; color:#007bff;">
        ${verificationLink}
      </p>

      <hr/>

      <p style="font-size:12px; color:gray;">
        If you did not create an account, you can safely ignore this email.
      </p>

    </div>

  </body>
  </html>
  `;
};

const resetPassTemplate = (name, resetLink) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
  </head>

  <body style="font-family: Arial; background:#f4f4f4; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px;">

      <h2 style="color:#333;">Password Reset Request</h2>

      <p>Hi ${name},</p>

      <p>You requested a password reset. Click the button below to reset your password:</p>

      <div style="text-align:center; margin:30px 0;">
        <a href="${resetLink}" 
           style="background:#FF5722; color:white; padding:12px 25px; text-decoration:none; border-radius:5px;">
           Reset Password
        </a>
      </div>

      <p>If the button does not work, copy and paste this link:</p>

      <p style="word-break:break-all; color:#007bff;">
        ${resetLink}
      </p>

      <hr/>

      <p style="font-size:12px; color:gray;">
        If you did not request this, you can safely ignore this email.
      </p>

    </div>

  </body>
  </html>
  `;
};

module.exports = { emailTemplate, resetPassTemplate };