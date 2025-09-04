
import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Controller('assistants')
export class AssistantsController {
  @Get()
  async list(@Req() req: any) {
    const orgId = req.headers['x-org-id'] || 'org_demo';
    return prisma.assistant.findMany({ where: { orgId } });
  }
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const orgId = req.headers['x-org-id'] || 'org_demo';
    return prisma.assistant.create({ data: { ...body, orgId } });
  }
}
