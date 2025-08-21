import '../styles/globals.css'
import { appWithTranslation } from 'next-i18next'
import { Analytics } from '@vercel/analytics/react'

function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}

export default appWithTranslation(App)
