export const adminCapabilities = [
  'overview:read',
  'users:read',
  'verification:review',
  'reports:review',
  'safety_cases:read',
  'moderation:review',
  'live:moderate',
  'communities:moderate',
  'events:moderate',
  'creators:review',
  'finance:read',
  'fraud:review',
  'appeals:review',
  'audit:read',
] as const;

export type AdminCapability = (typeof adminCapabilities)[number];

export interface AdminNavigationItem {
  readonly label: string;
  readonly href: string;
  readonly capability: AdminCapability;
}

export const adminNavigation: readonly AdminNavigationItem[] = [
  { label: 'Overview', href: '/overview', capability: 'overview:read' },
  { label: 'Users', href: '/users', capability: 'users:read' },
  { label: 'Verification', href: '/verification', capability: 'verification:review' },
  { label: 'Reports', href: '/reports', capability: 'reports:review' },
  { label: 'Safety Cases', href: '/safety-cases', capability: 'safety_cases:read' },
  { label: 'Moderation', href: '/moderation', capability: 'moderation:review' },
  { label: 'Live', href: '/live', capability: 'live:moderate' },
  { label: 'Communities', href: '/communities', capability: 'communities:moderate' },
  { label: 'Events', href: '/events', capability: 'events:moderate' },
  { label: 'Creators', href: '/creators', capability: 'creators:review' },
  { label: 'Finance', href: '/finance', capability: 'finance:read' },
  { label: 'Fraud', href: '/fraud', capability: 'fraud:review' },
  { label: 'Appeals', href: '/appeals', capability: 'appeals:review' },
  { label: 'Audit Logs', href: '/audit', capability: 'audit:read' },
] as const;

export function navigationForCapabilities(
  capabilities: ReadonlySet<AdminCapability>,
): readonly AdminNavigationItem[] {
  return adminNavigation.filter((item) => capabilities.has(item.capability));
}
