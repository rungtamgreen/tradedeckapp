/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
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

interface QuoteConfirmationProps {
  customerName?: string
  quoteDescription?: string
  quoteAmount?: string
  viewQuoteUrl?: string
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  businessLogo?: string
  defaultQuoteNotes?: string
  expiryDate?: string
  vatNumber?: string
}

const QuoteConfirmationEmail = ({
  customerName,
  quoteDescription,
  quoteAmount,
  viewQuoteUrl,
  businessName,
  businessAddress,
  businessPhone,
  businessEmail,
  businessLogo,
  defaultQuoteNotes,
  expiryDate,
  vatNumber,
}: QuoteConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your quote from {businessName || SITE_NAME}</Preview>
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
          You've received a new quote{businessName ? ` from ${businessName}` : ''}. Here are the details:
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
        {vatNumber && (
          <Text style={text}>
            <strong>VAT No:</strong> {vatNumber}
          </Text>
        )}
        {expiryDate && (
          <Text style={text}>
            <strong>Valid until:</strong> {expiryDate}
          </Text>
        )}
        {viewQuoteUrl && (
          <Button style={button} href={viewQuoteUrl}>
            View & Accept Quote
          </Button>
        )}
        {defaultQuoteNotes && (
          <>
            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
            <Text style={{ ...text, fontSize: '12px', color: '#777' }}>
              {defaultQuoteNotes}
            </Text>
          </>
        )}
        {(businessName || businessPhone || businessEmail || businessAddress) && (
          <>
            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
            <Text style={{ ...text, fontSize: '12px', color: '#777', margin: '0 0 4px' }}>
              {businessName && <>{businessName}<br /></>}
              {businessPhone && <>{businessPhone}<br /></>}
              {businessEmail && <>{businessEmail}<br /></>}
              {businessAddress && <>{businessAddress}</>}
            </Text>
          </>
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
  subject: (data: Record<string, any>) =>
    data.businessName
      ? `Your quote from ${data.businessName}`
      : 'You have a new quote from JobDeck',
  displayName: 'Quote confirmation',
  previewData: {
    customerName: 'Jane',
    quoteDescription: 'Kitchen renovation — full refit',
    quoteAmount: '£2,500.00',
    viewQuoteUrl: 'https://jobdeck.app/accept-quote?token=sample',
    businessName: 'Smith Plumbing',
    businessPhone: '07700 900000',
    businessEmail: 'info@smithplumbing.co.uk',
    defaultQuoteNotes: 'This quote is valid for 30 days. All prices include labour and parts unless stated.',
    expiryDate: '30 April 2026',
    vatNumber: 'GB123456789',
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
