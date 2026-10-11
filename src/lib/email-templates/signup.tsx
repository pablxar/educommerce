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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Confirma tu correo para {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>
          edu<span style={brandAccent}>commerce</span>
        </Text>
        <Heading style={h1}>Confirma tu correo</Heading>
        <Text style={text}>
          Gracias por crear tu cuenta en{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          .
        </Text>
        <Text style={text}>
          Confirma tu dirección de correo (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) haciendo clic en el botón:
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Confirmar mi correo
        </Button>
        <Text style={footer}>
          Si no creaste esta cuenta, puedes ignorar este correo.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
