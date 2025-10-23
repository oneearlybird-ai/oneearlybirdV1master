import type { StaticImageData } from "next/image";

import hubspotLogo from "@/public/logos/integrations/hubspot.svg";
import salesforceLogo from "@/public/logos/integrations/salesforce.svg";
import servicetitanLogo from "@/public/logos/integrations/servicetitan.svg";
import zohoLogo from "@/public/logos/integrations/zoho.svg";

export type CRMIntegration = {
  slug: string;
  name: string;
  logo: StaticImageData;
  summary: string;
  cardDescription: string;
  carouselDescription: string;
  carouselHighlights: string[];
  overview: string[];
  syncHighlights: string[];
  setupSteps: string[];
  playbooks: string[];
  website: string;
  industry: string;
  installBase: string;
};

export const crmIntegrations: CRMIntegration[] = [
  {
    slug: "hubspot",
    name: "HubSpot",
    logo: hubspotLogo,
    summary:
      "EarlyBird writes every call, booking, and escalation straight into HubSpot so revenue teams never lose context between the phones and the CRM.",
    cardDescription:
      "Sync call transcripts, tasks, and lifecycle updates into HubSpot immediately after each conversation.",
    carouselDescription:
      "Attach transcripts, update lifecycle stages, and assign follow-ups the moment a call wraps.",
    carouselHighlights: [
      "Match callers to contacts or companies automatically",
      "Attach AI transcripts + recordings to the timeline",
      "Create tasks for reps when escalations need humans",
    ],
    overview: [
      "Upgrade HubSpot with real-time call intelligence. EarlyBird detects the caller, logs a rich timeline event with the transcript, sentiment, and next steps, and keeps your lifecycle stages accurate without reps retyping notes.",
      "Teams get a single source of truth that shows the entire call journey beside deals, tickets, and marketing engagements so nobody wonders what really happened on the phones overnight.",
    ],
    syncHighlights: [
      "Caller matching against HubSpot contacts, companies, and recent form submissions.",
      "Timeline events with transcripts, audio recording links, sentiment, and AI summaries.",
      "Automatic lifecycle stage or deal phase updates based on call outcome.",
      "Task creation with due dates for escalations or promised follow-ups.",
      "Owner hand-offs with SLA reminders when VIPs or high-intent leads call in.",
    ],
    setupSteps: [
      "Connect HubSpot with OAuth (no manual API keys).",
      "Choose which pipelines, teams, or lifecycle stages EarlyBird should monitor.",
      "Map EarlyBird call outcomes to HubSpot lifecycle stages or deal properties.",
      "Enable transcript and recording attachments for qualifying calls.",
      "Test with a live call to confirm dispositions and automations fire correctly.",
    ],
    playbooks: [
      "After-hours bookings automatically create tasks for the morning team with the transcript attached.",
      "Escalated voicemails assign to the right owner and pause nurture sequences until someone replies.",
      "High-intent calls bump lifecycle stage and trigger a Slack + email alert for sales leadership.",
    ],
    website: "https://www.hubspot.com",
    industry: "CRM & Marketing Automation",
    installBase: "194K+",
  },
  {
    slug: "salesforce",
    name: "Salesforce",
    logo: salesforceLogo,
    summary:
      "Pipe qualified calls, bookings, and follow-ups into Salesforce automatically so ops, sales, and service stay aligned.",
    cardDescription:
      "Create leads, update opportunities, and leave call intelligence inside Salesforce with zero manual data entry.",
    carouselDescription:
      "Auto-create leads and tasks while logging transcripts to the right objects in Salesforce.",
    carouselHighlights: [
      "Convert qualified callers into leads or contacts automatically",
      "Update opportunity stages from recorded call outcomes",
      "Open follow-up tasks with due dates when humans need to step in",
    ],
    overview: [
      "EarlyBird keeps Salesforce accurate even when the phones never stop. We identify the caller, create or update the right record, and log conversational data so teams understand exactly what happened before they pick up the workflow.",
      "Whether you run Sales Cloud or Service Cloud, transcripts, dispositions, and scheduling data land exactly where reps expect to see them.",
    ],
    syncHighlights: [
      "Lead or contact creation with caller enrichment and source tagging.",
      "Opportunity stage updates when calls advance, close, or cancel deals.",
      "Case notes and follow-up activities with SLA timers for support teams.",
      "Task creation with owners, due dates, and links back to call recordings.",
      "Campaign attribution for inbound calls tied to marketing programs.",
    ],
    setupSteps: [
      "Authenticate with Salesforce using a connected app provisioned by your admin.",
      "Select which objects (leads, contacts, opportunities, cases) EarlyBird should sync.",
      "Map call outcomes to the fields and stages your team relies on.",
      "Decide which recordings and transcripts should attach automatically.",
      "Run a sandbox sync to validate permissions before going live.",
    ],
    playbooks: [
      "Qualified new callers generate a lead, create a follow-up task, and notify the owning AE.",
      "Support escalations open a case with transcript context and SLA countdowns.",
      "Deals in negotiation get stage nudges automatically when customers call back to confirm.",
    ],
    website: "https://www.salesforce.com",
    industry: "Enterprise CRM",
    installBase: "150K+",
  },
  {
    slug: "servicetitan",
    name: "ServiceTitan",
    logo: servicetitanLogo,
    summary:
      "Home services teams route bookings, technician dispatches, and revenue opportunities from the phone straight into ServiceTitan.",
    cardDescription:
      "Push every booked job, transcript, and disposition into ServiceTitan in real time.",
    carouselDescription:
      "Sync call outcomes, job bookings, and tags so dispatch never works off stale data.",
    carouselHighlights: [
      "Create jobs with service type, marketing campaign, and caller intent",
      "Tag repeat callers or warranty work automatically",
      "Drop transcripts into the job record for technicians and CSRs",
    ],
    overview: [
      "EarlyBird acts like another seasoned CSR who never forgets the details. We capture everything your callers share, book jobs, and update ServiceTitan immediately so dispatch and ops see the same information your callers heard.",
      "Technicians roll with context, marketing attribution stays intact, and managers get the reporting they trust—without middle-of-the-night data entry.",
    ],
    syncHighlights: [
      "Job creation with campaign attribution, priority, and urgency indicators.",
      "Customer and location updates when contact info changes mid-call.",
      "Automatic job tags for warranty work, membership calls, or VIP customers.",
      "Transcripts and call recordings linked to the job for technicians and QA.",
      "Follow-up tasks for unscheduled estimates or parts that need ordering.",
    ],
    setupSteps: [
      "Connect your ServiceTitan account with EarlyBird using a technician-level API key.",
      "Choose the business units, tags, and campaigns we should use when logging activity.",
      "Configure job templates for common booking scenarios EarlyBird handles.",
      "Map outcome codes (booked, reschedule, parts check) to your reporting fields.",
      "Validate with a live call to confirm jobs appear with the right metadata.",
    ],
    playbooks: [
      "After-hours bookings land in the morning dispatch board with priority flags applied.",
      "Membership calls automatically tag the customer record and trigger renewal workflows.",
      "Voicemails about urgent issues create jobs with a 'needs immediate call back' task.",
    ],
    website: "https://www.servicetitan.com",
    industry: "Field Service Management",
    installBase: "11K+",
  },
  {
    slug: "zoho-crm",
    name: "Zoho CRM",
    logo: zohoLogo,
    summary:
      "Give your Zoho teams instant visibility into calls, transcripts, and next steps captured by EarlyBird.",
    cardDescription:
      "Log calls, update deals, and assign reminders inside Zoho CRM automatically.",
    carouselDescription:
      "Keep leads, deals, and activities aligned with what customers said on the phone.",
    carouselHighlights: [
      "Create or update leads with enriched caller context",
      "Drop call summaries on deals and contacts moments after the call",
      "Schedule follow-up activities based on promised actions",
    ],
    overview: [
      "Replace manual call logging in Zoho CRM with real-time sync from EarlyBird. Every conversation enriches the record with transcripts, intent, and recommended next steps so sales, service, and marketing stay on the same page.",
      "Use the data to trigger Blueprint automations, score leads, and keep managers informed without chasing reps for updates.",
    ],
    syncHighlights: [
      "New leads with source and campaign data when prospects call for the first time.",
      "Contact updates with latest phone numbers, emails, and preferred communication channels.",
      "Deal notes that summarize intent, objections, and agreed next steps.",
      "Task creation that aligns with Zoho workflow rules and reminders.",
      "Custom field updates so reports reflect real-time call outcomes.",
    ],
    setupSteps: [
      "Authenticate with Zoho CRM using OAuth and select the org to connect.",
      "Grant EarlyBird access to modules where you want call intelligence stored.",
      "Map contact fields and deal stages to the call outcomes you track.",
      "Enable transcript attachments and choose which teams should receive them.",
      "Run a calibration call to confirm Blueprint automations fire as expected.",
    ],
    playbooks: [
      "Inbound leads automatically receive a call summary email while tasks assign to the owning rep.",
      "Renewal conversations append to the deal with intent tagging so success can intervene proactively.",
      "Missed calls from hot leads trigger an SMS follow-up and a task before the SLA breaches.",
    ],
    website: "https://www.zoho.com/crm/",
    industry: "CRM & Sales Automation",
    installBase: "250K+",
  },
];

export const crmIntegrationMap = new Map(crmIntegrations.map((integration) => [integration.slug, integration]));
