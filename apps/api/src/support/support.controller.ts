
import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from '../notifications/email.service';
@Controller('support')
export class SupportController {
  @Post()
  async submit(@Body() body: { email: string; message: string }) {
    const email = new EmailService();
    await email.send('support@earlybird.ai', 'Support Request', `<p>From: ${body.email}</p><p>${body.message}</p>`);
    return { ok: true };
  }
}
