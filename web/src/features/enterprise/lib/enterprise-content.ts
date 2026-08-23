/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
/**
 * Static content for the enterprise cooperation page.
 *
 * All user-facing strings below are i18n keys (English source). The actual
 * translations live in `src/i18n/locales/*.json`; components resolve them via
 * `t()`. Per AGENTS 3.1, no literal copy is hard-coded in the JSX.
 */

export type EnterpriseFeature = {
  /** i18n key for the feature title */
  titleKey: string
  /** i18n key for the feature description */
  descriptionKey: string
  /** short metric or label shown above the title */
  badgeKey: string
}

export const ENTERPRISE_PLANS: EnterpriseFeature[] = [
  {
    badgeKey: 'SLA 99.9%',
    titleKey: 'Dedicated uptime SLA',
    descriptionKey:
      'Backed by a financially backed service level agreement for mission-critical workloads.',
  },
  {
    badgeKey: 'Isolated capacity',
    titleKey: 'Dedicated channels',
    descriptionKey:
      'Reserve isolated channels and quotas so your traffic never contends with others.',
  },
  {
    badgeKey: 'Priority',
    titleKey: 'Priority support',
    descriptionKey:
      'A dedicated response channel with prioritized handling for incidents.',
  },
]

export const DEPLOYMENT_OPTIONS: EnterpriseFeature[] = [
  {
    badgeKey: 'SaaS',
    titleKey: 'Fully managed SaaS',
    descriptionKey: 'Onboard in minutes with zero infrastructure to operate.',
  },
  {
    badgeKey: 'On-prem / VPC',
    titleKey: 'Private deployment',
    descriptionKey:
      'Deploy inside your own VPC or on-premises to meet data-residency requirements.',
  },
]

export const SECURITY_POINTS: EnterpriseFeature[] = [
  {
    badgeKey: 'TLS',
    titleKey: 'Encrypted in transit',
    descriptionKey: 'All traffic is served over HTTPS with modern TLS.',
  },
  {
    badgeKey: 'Privacy',
    titleKey: 'We do not store request content',
    descriptionKey:
      'Request payloads and responses are not persisted; only aggregated usage metadata is retained for billing.',
  },
]

export const CUSTOMER_SCENARIOS: EnterpriseFeature[] = [
  {
    badgeKey: 'Throughput',
    titleKey: 'High-throughput inference',
    descriptionKey:
      'Batch and real-time inference for customer-facing products.',
  },
  {
    badgeKey: 'Internal',
    titleKey: 'Internal copilots',
    descriptionKey: 'Assistants grounded on your private knowledge base.',
  },
  {
    badgeKey: 'Routing',
    titleKey: 'Multi-provider routing',
    descriptionKey:
      'Route traffic across providers with a single OpenAI-compatible endpoint.',
  },
]
