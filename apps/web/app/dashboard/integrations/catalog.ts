export type Integration = {
  id: 'google-calendar' | 'calendly' | 'slack' | 'hubspot' | 'salesforce';
  name: string;
  status?: 'connected' | 'disconnected';
};

export const INTEGRATIONS: Integration[] = [
  { id: 'google-calendar', name: 'Google Calendar' },
  { id: 'calendly', name: 'Calendly' },
  { id: 'slack', name: 'Slack' },
  { id: 'hubspot', name: 'HubSpot' },
  { id: 'salesforce', name: 'Salesforce' },
];

