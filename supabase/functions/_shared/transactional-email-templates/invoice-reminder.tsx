/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'JobDeck'

interface InvoiceReminderProps {
  customerName?: string
  invoiceDescription?: string
  invoiceAmount?: string
  dueDate?: string
}

const InvoiceReminderEmail = ({
  customerName,
  invoiceDescription,
  invoiceAmount,
  dueDate,
}: InvoiceReminderProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Payment reminder from {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <div style={logoBadge}>
            <span style={logoText}>JD</span>
          </div>
        </Section>
        <Heading style={h1}>
          {customerName ? `Hi ${customerName},` : 'Hi there,'}
        </Heading>
        <Text style={text}>
          This is a friendly reminder that you have an outstanding invoice from {SITE_NAME}.
        </Text>
        {invoiceDescription && (
          <Text style={text}>
            <strong>Description:</strong> {invoiceDescription}
          </Text>
        )}
        {invoiceAmount && (
          <Text style={text}>
            <strong>Amount due:</strong> {invoiceAmount}
          </Text>
        )}
        {dueDate && (
          <Text style={text}>
            <strong>Due date:</strong> {dueDate}
          </Text>
        )}
        <Text style={text}>
          Please arrange payment at your earliest convenience. If you've already paid, please disregard this reminder.
        </Text>
        <Text style={footer}>
          This reminder was sent via {SITE_NAME}. If you have any questions, please
          reply directly to the sender.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InvoiceReminderEmail,
  subject: 'Payment reminder from JobDeck',
  displayName: 'Invoice reminder',
  previewData: {
    customerName: 'Jane',
    invoiceDescription: 'Bathroom renovation — labour and materials',
    invoiceAmount: '£1,800.00',
    dueDate: '15 January 2025',
  },
} satisfies TemplateEntry

const brandColor = '#2455a0'
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoBadge = {
  display: 'inline-block',
  backgroundColor: brandColor,
  borderRadius: '12px',
  width: '48px',
  height: '48px',
  lineHeight: '48px',
  textAlign: 'center' as const,
}
const logoText = { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' as const }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1a1a2e',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
