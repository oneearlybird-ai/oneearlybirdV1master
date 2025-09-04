
export class EmailService {
  async send(to: string, subject: string, html: string) {
    if (!process.env.POSTMARK_API_KEY) {
      console.log(`[DEV email] to=${to} subject=${subject} html=${html}`);
      return;
    }
    // TODO: integrate real provider (Postmark API)
  }
}
