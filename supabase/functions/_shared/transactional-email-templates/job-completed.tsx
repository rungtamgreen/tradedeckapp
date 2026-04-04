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

interface JobCompletedProps {
  customerName?: string
  jobDescription?: string
  jobPrice?: string
  completedDate?: string
}

const JobCompletedEmail = ({
  customerName,
  jobDescription,
  jobPrice,
  completedDate,
}: JobCompletedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your job has been completed — {SITE_NAME}</Preview>
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
          Great news! Your job has been completed.
        </Text>
        {jobDescription && (
          <Text style={text}>
            <strong>Job:</strong> {jobDescription}
          </Text>
        )}
        {jobPrice && (
          <Text style={text}>
            <strong>Total:</strong> {jobPrice}
          </Text>
        )}
        {completedDate && (
          <Text style={text}>
            <strong>Completed:</strong> {completedDate}
          </Text>
        )}
        <Text style={text}>
          Thank you for choosing us. If you have any questions or need further assistance, please don't hesitate to get in touch.
        </Text>
        <Text style={footer}>
          This notification was sent via {SITE_NAME}. If you have any questions, please
          reply directly to the sender.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: JobCompletedEmail,
  subject: 'Your job has been completed',
  displayName: 'Job completed notification',
  previewData: {
    customerName: 'Jane',
    jobDescription: 'Kitchen renovation — full refit',
    jobPrice: '£3,200.00',
    completedDate: '4 April 2026',
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
