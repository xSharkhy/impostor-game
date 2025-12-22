import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@impostor.ismobla.dev'

class EmailService {
  async sendNewSuggestionNotification(
    word: string,
    category: string,
    suggestedBy: string
  ): Promise<boolean> {
    if (!resend || !ADMIN_EMAIL) {
      console.log('Email service not configured, skipping notification')
      return false
    }

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Nueva sugerencia de palabra: ${word}`,
        html: `
          <h2>Nueva sugerencia de palabra</h2>
          <p><strong>Palabra:</strong> ${word}</p>
          <p><strong>Categoría:</strong> ${category}</p>
          <p><strong>Sugerido por:</strong> ${suggestedBy}</p>
          <p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin">
              Revisar sugerencias
            </a>
          </p>
        `,
      })
      console.log(`Email notification sent for word: ${word}`)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
