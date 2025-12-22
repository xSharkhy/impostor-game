export interface IEmailService {
  /**
   * Send notification when a new word is suggested
   */
  sendNewSuggestionNotification(
    word: string,
    category: string,
    suggestedBy: string
  ): Promise<boolean>
}
