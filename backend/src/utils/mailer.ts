import https from 'https';

async function sendEmailBrevo(to: string, subject: string, html: string) {
  const data = JSON.stringify({
    sender: { name: 'ColocBénin', email: process.env.BREVO_SENDER_EMAIL || 'charlessacca33@gmail.com' },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => res.statusCode! < 300 ? resolve(body) : reject(new Error(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  return sendEmailBrevo(to, subject, html);
}