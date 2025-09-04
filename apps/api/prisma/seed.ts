
/** Seed demo data for EarlyBird */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const org = await prisma.org.upsert({
    where: { id: 'org_demo' },
    update: {},
    create: { id: 'org_demo', name: 'Demo Health Clinic', plan: 'Starter' }
  });
  await prisma.user.upsert({ where: { email: 'owner@demo.org' }, update: {}, create: { email: 'owner@demo.org', orgId: org.id, role: 'OWNER' } });
  await prisma.assistant.upsert({ where: { id: 'asst_medical_demo' }, update: {}, create: { id: 'asst_medical_demo', orgId: org.id, name: 'Front Desk — Clinic', vertical: 'medical', voice: 'elevenlabs:charlotte', language: 'en-US', prompt: 'Friendly clinic receptionist.', guardrailsJson: { pii: true } as any } });
  await prisma.assistant.upsert({ where: { id: 'asst_legal_demo' }, update: {}, create: { id: 'asst_legal_demo', orgId: org.id, name: 'Reception — Law Firm', vertical: 'legal', voice: 'elevenlabs:alloy', language: 'en-US', prompt: 'Screen inbound leads for a law firm.', guardrailsJson: { pii: true } as any } });
  await prisma.fAQ.createMany({ data: [
    { orgId: org.id, question: 'What are your hours?', answer: 'Mon–Fri 8am–6pm.' },
    { orgId: org.id, question: 'Do you accept walk-ins?', answer: 'Prefer scheduled appointments.' },
    { orgId: org.id, question: 'Where are you located?', answer: '123 Market St, Suite 500.' }
  ], skipDuplicates: true });
  await prisma.booking.upsert({ where: { id: 'bk_demo' }, update: {}, create: { id: 'bk_demo', orgId: org.id, customerName: 'Alex Caller', customerEmail: 'alex@example.com', providerCalendarId: 'cal_demo_provider', startISO: new Date(Date.now()+3*3600_000), endISO: new Date(Date.now()+4*3600_000), calendarStatus: 'confirmed' } });
  await prisma.orgAnalytics.upsert({ where: { orgId: org.id }, update: { callsTotal: 42, minutesTotal: 180, revenueUsd: 45, cogsUsd: 9 }, create: { orgId: org.id, callsTotal: 42, minutesTotal: 180, revenueUsd: 45, cogsUsd: 9 } });
  console.log('Seed complete');
}
main().finally(()=>prisma.$disconnect());
