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

interface QuoteConfirmationProps {
  customerName?: string
  quoteDescription?: string
  quoteAmount?: string
  viewQuoteUrl?: string
}

const QuoteConfirmationEmail = ({
  customerName,
  quoteDescription,
  quoteAmount,
  viewQuoteUrl,
}: QuoteConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your quote from {SITE_NAME}</Preview>
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
          You've received a new quote from {SITE_NAME}. Here are the details:
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
        {viewQuoteUrl && (
          <Button style={button} href={viewQuoteUrl}>
            View & Accept Quote
          </Button>
        )}
        <Text style={footer}>
          This quote was sent via {SITE_NAME}. If you have any questions, please
          reply directly to the sender.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: QuoteConfirmationEmail,
  subject: 'You have a new quote from JobDeck',
  displayName: 'Quote confirmation',
  previewData: {
    customerName: 'Jane',
    quoteDescription: 'Kitchen renovation — full refit',
    quoteAmount: '£2,500.00',
    viewQuoteUrl: 'https://jobdeck.app/accept-quote?token=sample',
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
const button = {
  backgroundColor: brandColor,
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
