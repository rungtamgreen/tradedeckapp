/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'JobDeck'

interface InvoiceReminderProps {
  customerName?: string
  invoiceDescription?: string
  invoiceAmount?: string
  dueDate?: string
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessLogo?: string
  defaultInvoiceNotes?: string
  paymentDetails?: string
  vatNumber?: string
}

const InvoiceReminderEmail = ({
  customerName,
  invoiceDescription,
  invoiceAmount,
  dueDate,
  businessName,
  businessAddress,
  businessPhone,
  businessLogo,
  defaultInvoiceNotes,
  paymentDetails,
  vatNumber,
}: InvoiceReminderProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Payment reminder from {businessName || SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          {businessLogo ? (
            <Img src={businessLogo} alt={businessName || SITE_NAME} width="80" height="80" style={{ borderRadius: '12px', objectFit: 'contain' as any }} />
          ) : (
            <div style={logoBadge}>
              <span style={logoText}>JD</span>
            </div>
          )}
        </Section>
        <Heading style={h1}>
          {customerName ? `Hi ${customerName},` : 'Hi there,'}
        </Heading>
        <Text style={text}>
          This is a friendly reminder that you have an outstanding invoice{businessName ? ` from ${businessName}` : ''}.
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
        {vatNumber && (
          <Text style={text}>
            <strong>VAT No:</strong> {vatNumber}
          </Text>
        )}
        {dueDate && (
          <Text style={text}>
            <strong>Due date:</strong> {dueDate}
          </Text>
        )}
        {paymentDetails && (
          <>
            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
            <Text style={{ ...text, marginBottom: '8px' }}>
              <strong>Payment details:</strong>
            </Text>
            <Text style={{ ...text, whiteSpace: 'pre-line' as any }}>
              {paymentDetails}
            </Text>
          </>
        )}
        <Text style={text}>
          Please arrange payment at your earliest convenience. If you've already paid, please disregard this reminder.
        </Text>
        {defaultInvoiceNotes && (
          <>
            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
            <Text style={{ ...text, fontSize: '12px', color: '#777' }}>
              {defaultInvoiceNotes}
            </Text>
          </>
        )}
        {(businessName || businessPhone || businessAddress) && (
          <>
            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
            <Text style={{ ...text, fontSize: '12px', color: '#777', margin: '0 0 4px' }}>
              {businessName && <>{businessName}<br /></>}
              {businessPhone && <>{businessPhone}<br /></>}
              {businessAddress && <>{businessAddress}</>}
            </Text>
          </>
        )}
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
  subject: (data: Record<string, any>) =>
    data.businessName
      ? `Payment reminder from ${data.businessName}`
      : 'Payment reminder from JobDeck',
  displayName: 'Invoice reminder',
  previewData: {
    customerName: 'Jane',
    invoiceDescription: 'Bathroom renovation — labour and materials',
    invoiceAmount: '£1,800.00',
    dueDate: '15 January 2025',
    businessName: 'Smith Plumbing',
    businessPhone: '07700 900000',
    paymentDetails: 'Bank: Barclays | Account: J Smith | Acc No: 12345678 | Sort: 12-34-56',
    defaultInvoiceNotes: 'Please pay within 14 days.',
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
