import { Resend } from 'resend'
import { IEmailService } from '../../application/ports/services/IEmailService.js'
import { env } from '../../config/env.js'

export class ResendEmailService implements IEmailService {
  private resend: Resend

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey)
  }

  async sendNewSuggestionNotification(
    word: string,
    category: string,
    suggestedBy: string
  ): Promise<boolean> {
    if (env.adminEmails.length === 0) {
      console.warn('No admin emails configured, skipping notification')
      return false
    }

    try {
      const { error } = await this.resend.emails.send({
        from: 'El Impostor <noreply@elimpostor.app>',
        to: env.adminEmails,
        subject: `Nueva sugerencia de palabra: "${word}"`,
        html: `
          <h2>Nueva sugerencia de palabra</h2>
          <p><strong>Palabra:</strong> ${word}</p>
          <p><strong>Categoría:</strong> ${category}</p>
          <p><strong>Sugerida por:</strong> ${suggestedBy}</p>
          <p>
            <a href="${env.appUrl}/admin">
              Revisar en el panel de administración
            </a>
          </p>
        `,
        text: `
          Nueva sugerencia de palabra

          Palabra: ${word}
          Categoría: ${category}
          Sugerida por: ${suggestedBy}

          Revisar en: ${env.appUrl}/admin
        `,
      })

      if (error) {
        console.error('Failed to send email:', error.message)
        return false
      }

      return true
    } catch (err) {
      console.error('Failed to send email:', err)
      return false
    }
  }
}
