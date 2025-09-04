
import { Controller, Get } from '@nestjs/common';
@Controller('version')
export class VersionController {
  @Get()
  info() { return { version: process.env.APP_VERSION ?? 'v1.0.1', commit: process.env.GIT_COMMIT ?? 'unknown' }; }
}
