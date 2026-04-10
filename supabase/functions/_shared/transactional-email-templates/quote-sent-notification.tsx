/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
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

interface QuoteSentNotificationProps {
  customerName?: string
  quoteDescription?: string
  quoteAmount?: string
}

const QuoteSentNotificationEmail = ({
  customerName,
  quoteDescription,
  quoteAmount,
}: QuoteSentNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Quote sent to {customerName || 'your customer'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <div style={logoBadge}>
            <span style={logoText}>JD</span>
          </div>
        </Section>
        <Heading style={h1}>Quote Sent ✓</Heading>
        <Text style={text}>
          Your quote has been sent to <strong>{customerName || 'your customer'}</strong>.
        </Text>
        {quoteDescription && (
          <Text style={text}>
            <strong>Description:</strong> {quoteDescription}
          </Text>
        )}
        {quoteAmount && (
          <Text style={text}>
            <strong>Amount:</strong> {quoteAmount}
          </Text>
        )}
        <Text style={text}>
          You'll be notified when the customer responds to the quote.
        </Text>
        <Text style={footer}>
          This notification was sent via {SITE_NAME}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: QuoteSentNotificationEmail,
  subject: 'Quote sent to your customer',
  displayName: 'Quote sent notification',
  previewData: {
    customerName: 'Jane Smith',
    quoteDescription: 'Kitchen renovation — full refit',
    quoteAmount: '£2,500.00',
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
