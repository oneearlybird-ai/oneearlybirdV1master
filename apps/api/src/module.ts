
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './routes/health.controller';
import { VersionController } from './routes/version.controller';
import { StorageModule } from './storage/storage.module';
import { SupportController } from './support/support.controller';
import { AssistantsController } from './assistants/assistants.controller';
import { AnalyticsController } from './routes/analytics.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), StorageModule],
  controllers: [HealthController, VersionController, SupportController, AssistantsController, AnalyticsController],
  providers: [],
})
export class AppModule {}
