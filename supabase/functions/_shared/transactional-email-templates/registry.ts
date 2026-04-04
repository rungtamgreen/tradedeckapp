/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as quoteConfirmation } from './quote-confirmation.tsx'
import { template as invoiceReminder } from './invoice-reminder.tsx'
import { template as jobCompleted } from './job-completed.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'quote-confirmation': quoteConfirmation,
  'invoice-reminder': invoiceReminder,
  'job-completed': jobCompleted,
}
