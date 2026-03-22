import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRentReminderEmail(
  tenantEmail: string,
  tenantName: string,
  propertyAddress: string,
  rentAmount: number,
  dueDate: string
) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'hello@landlordmap.co.uk',
    to: tenantEmail,
    subject: `Rent reminder — ${propertyAddress}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0F172A;">Rent Reminder</h2>
        <p>Dear ${tenantName},</p>
        <p>This is a friendly reminder that your rent of <strong>£${rentAmount.toLocaleString()}</strong>
        is due on <strong>${dueDate}</strong> for ${propertyAddress}.</p>
        <p>Please ensure payment is made to the account details provided in your tenancy agreement.</p>
        <p>If you have any questions or concerns, please don't hesitate to get in touch.</p>
        <p>Kind regards,<br>Your Landlord</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">Sent via LandlordMap</p>
      </div>
    `,
  })
}

export async function sendMaintenanceUpdateEmail(
  tenantEmail: string,
  tenantName: string,
  issueTitle: string,
  status: string,
  notes?: string
) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'hello@landlordmap.co.uk',
    to: tenantEmail,
    subject: `Maintenance update: ${issueTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0F172A;">Maintenance Update</h2>
        <p>Dear ${tenantName},</p>
        <p>We wanted to update you on your maintenance request: <strong>${issueTitle}</strong></p>
        <p>Current status: <strong>${status.replace('_', ' ')}</strong></p>
        ${notes ? `<p>Notes: ${notes}</p>` : ''}
        <p>We will keep you updated on any further progress.</p>
        <p>Kind regards,<br>Your Landlord</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">Sent via LandlordMap</p>
      </div>
    `,
  })
}
