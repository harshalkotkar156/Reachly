const getEmailTemplate = (name, company) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Job Inquiry</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 620px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 22px;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .body {
      padding: 36px 40px;
      color: #333333;
      line-height: 1.8;
      font-size: 15px;
    }
    .body p {
      margin: 0 0 16px;
    }
    .highlight {
      color: #667eea;
      font-weight: 600;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px 40px;
      text-align: center;
      font-size: 12px;
      color: #999999;
      border-top: 1px solid #eeeeee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Job Inquiry – Full Stack Developer</h1>
    </div>
    <div class="body">
      <p>Hello <span class="highlight">${name}</span>,</p>

      <p>I hope you are doing well.</p>

      <p>
        I am reaching out to explore potential opportunities at
        <span class="highlight">${company}</span>.
      </p>

      <p>
        I am a final-year <strong>Information Technology</strong> student specializing in
        full-stack development with hands-on experience in
        <strong>React, Node.js, MongoDB</strong>, and building scalable backend systems.
        I have worked on real-world projects involving REST APIs, authentication systems,
        and cloud deployments.
      </p>

      <p>
        I would greatly appreciate the opportunity to interview or discuss potential
        roles — whether full-time, internship, or contract — at your organization.
      </p>

      <p>
        I have attached my resume for your reference. Please feel free to reach out
        at your convenience.
      </p>

      <p>Thank you for your time and consideration.</p>

      <p>
        Warm regards,<br />
        <strong>Harshal Kotkar</strong><br />
        Final Year IT Student | Full Stack Developer<br />
        📧 ${process.env.EMAIL_USER}
      </p>
    </div>
    <div class="footer">
      This email was sent as a job inquiry. Please disregard if not relevant.
    </div>
  </div>
</body>
</html>
`;
};

module.exports = { getEmailTemplate };
