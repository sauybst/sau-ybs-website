import { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginPage() {
  return <LoginClient />
}