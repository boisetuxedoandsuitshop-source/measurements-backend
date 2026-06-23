import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendMeasurementEmail(measurementData) {
  const {
    customer_name,
    customer_email,
    customer_phone,
    wedding_name,
    order_type,
    chest,
    overarm,
    mid_section,
    waist,
    outseam,
    neck,
    shirt_sleeve,
    height,
    weight,
    shoe_size,
    jacket_sleeve,
    shoe_width,
    preferred_fit,
    special_requests,
    pickup_date,
    return_date,
  } = measurementData;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a; border-bottom: 2px solid #cc0000; padding-bottom: 10px;">
        New Measurement Submission
      </h2>

      <div style="background: #f9f6f0; padding: 20px; border-radius: 4px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Customer Information</h3>
        <p><strong>Name:</strong> ${customer_name}</p>
        <p><strong>Email:</strong> ${customer_email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${customer_phone || 'Not provided'}</p>
        <p><strong>Wedding/Event:</strong> ${wedding_name || 'Not specified'}</p>
        <p><strong>Order Type:</strong> ${order_type || 'Not specified'}</p>
      </div>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Measurements (inches)</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Chest</strong></td>
            <td style="padding: 8px;">${chest || '—'}</td>
            <td style="padding: 8px; padding-left: 20px;"><strong>Jacket Sleeve</strong></td>
            <td style="padding: 8px;">${jacket_sleeve || 'Optional'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Overarm</strong></td>
            <td style="padding: 8px;">${overarm || '—'}</td>
            <td style="padding: 8px; padding-left: 20px;"><strong>Height</strong></td>
            <td style="padding: 8px;">${height || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Mid Section</strong></td>
            <td style="padding: 8px;">${mid_section || '—'}</td>
            <td style="padding: 8px; padding-left: 20px;"><strong>Weight (lbs)</strong></td>
            <td style="padding: 8px;">${weight || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Waist</strong></td>
            <td style="padding: 8px;">${waist || '—'}</td>
            <td style="padding: 8px; padding-left: 20px;"><strong>Shoe Size</strong></td>
            <td style="padding: 8px;">${shoe_size || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Outseam</strong></td>
            <td style="padding: 8px;">${outseam || '—'}</td>
            <td style="padding: 8px; padding-left: 20px;"><strong>Shoe Width</strong></td>
            <td style="padding: 8px;">${shoe_width || 'Not specified'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Neck</strong></td>
            <td style="padding: 8px;">${neck || '—'}</td>
            <td style="padding: 8px; padding-left: 20px;"><strong>Preferred Fit</strong></td>
            <td style="padding: 8px;">${preferred_fit || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Shirt Sleeve</strong></td>
            <td style="padding: 8px;">${shirt_sleeve || '—'}</td>
          </tr>
        </table>
      </div>

      ${
        pickup_date || return_date
          ? `<div style="background: #e8f4f8; padding: 20px; border-radius: 4px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Rental Dates</h3>
        <p><strong>Pickup Date:</strong> ${pickup_date || 'Not specified'}</p>
        <p><strong>Return Date:</strong> ${return_date || 'Not specified'}</p>
      </div>`
          : ''
      }

      ${
        special_requests
          ? `<div style="background: #fef8e8; padding: 20px; border-radius: 4px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Special Requests</h3>
        <p>${special_requests.replace(/\n/g, '<br>')}</p>
      </div>`
          : ''
      }

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <p>This measurement was submitted through your Boise Tuxedo Shop measurements form.</p>
        <p>Log in to your admin dashboard to view and manage all submissions.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: `New Measurement Submission - ${customer_name}${wedding_name ? ` - ${wedding_name}` : ''}`,
      html: emailHtml,
    });
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export default transporter;
