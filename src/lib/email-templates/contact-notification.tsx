import React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const ContactNotification = ({ name, email, subject, message }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nuevo mensaje de contacto de {name ?? 'un visitante'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Nuevo mensaje desde «Hablemos»</Heading>
        <Text style={text}>Alguien completó el formulario de contacto de educommerce.cl:</Text>
        <Section style={box}>
          <Text style={label}>Nombre</Text>
          <Text style={value}>{name ?? '—'}</Text>
          <Text style={label}>Correo</Text>
          <Text style={value}>{email ?? '—'}</Text>
          <Text style={label}>Asunto</Text>
          <Text style={value}>{subject ?? 'Sin asunto'}</Text>
          <Hr style={hr} />
          <Text style={label}>Mensaje</Text>
          <Text style={valueMessage}>{message ?? '—'}</Text>
        </Section>
        <Text style={footer}>Puedes responder directamente al correo de la persona desde tu bandeja.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactNotification,
  subject: (data: Record<string, any>) =>
    `Contacto web: ${data['subject'] || 'Nuevo mensaje'} — ${data['name'] ?? ''}`.trim(),
  displayName: 'Notificación de contacto',
  previewData: {
    name: 'María González',
    email: 'maria@example.com',
    subject: 'Duda sobre el programa completo',
    message: 'Hola, quiero saber si el programa incluye acceso al campus y por cuánto tiempo. ¡Gracias!',
  },
  to: 'educommerce.admin@gmail.com',
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const heading = { color: '#0f1f1a', fontSize: '22px', margin: '0 0 8px' }
const text = { color: '#3d4f47', fontSize: '14px', lineHeight: '22px' }
const box = { backgroundColor: '#f4f7f5', borderRadius: '12px', padding: '16px 20px', margin: '16px 0' }
const label = { color: '#1EA180', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' as const, letterSpacing: '0.06em', margin: '12px 0 2px' }
const value = { color: '#0f1f1a', fontSize: '15px', margin: '0' }
const valueMessage = { color: '#0f1f1a', fontSize: '15px', lineHeight: '24px', margin: '0', whiteSpace: 'pre-wrap' as const }
const hr = { borderColor: '#dde6e1', margin: '16px 0 4px' }
const footer = { color: '#7a8a83', fontSize: '12px', marginTop: '16px' }
