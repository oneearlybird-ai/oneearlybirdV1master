
import { Controller, Get, Req } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Controller('analytics')
export class AnalyticsController {
  @Get('funnel')
  async funnel(@Req() req: any) {
    const orgId = req.headers['x-org-id'] || 'org_demo';
    const calls = await prisma.callQuality.count({ where: {} });
    const booked = await prisma.booking.count({ where: { orgId } });
    const callsTotal = await prisma.orgAnalytics.findUnique({ where: { orgId } });
    return { calls: callsTotal?.callsTotal ?? 0, answered: calls, booked, conversion: (callsTotal?.callsTotal ?? 0) ? (booked / (callsTotal?.callsTotal ?? 1)) : 0 };
  }
}
