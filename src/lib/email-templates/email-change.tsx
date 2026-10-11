import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Confirma tu cambio de correo en {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>
          edu<span style={brandAccent}>commerce</span>
        </Text>
        <Heading style={h1}>Confirma tu cambio de correo</Heading>
        <Text style={text}>
          Solicitaste cambiar tu correo de {siteName} desde{' '}
          <Link href={`mailto:${oldEmail}`} style={link}>
            {oldEmail}
          </Link>{' '}
          a{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={text}>Haz clic en el botón para confirmar el cambio:</Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Confirmar cambio de correo
        </Button>
        <Text style={footer}>
          Si no solicitaste este cambio, protege tu cuenta de inmediato.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const brand = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 24px',
}
const brandAccent = { color: '#1EA180' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: '#1EA180',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  border: '1px solid #1EA180',
  borderRadius: '999px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #1EA180 !important; color: #ffffff !important; }
  }
  [data-ogsc] .dm-btn { background-color: #1EA180 !important; color: #ffffff !important; }
  [data-ogsb] .dm-btn { background-color: #1EA180 !important; color: #ffffff !important; }
`
