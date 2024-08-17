import Script from 'next/script'
import '../styles/shared/global.css'
import QueryProvider from './lib/Providers'
import ReduxProvider from './redux/provider'
import { GoogleAnalytics } from '@next/third-parties/google'


export const metadata = {
  title: 'Drawlys',
  description: 'the best choice',
}

export default async function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          id='faceboockPixel'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html:`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1256967862379138');
              fbq('track', 'PageView');
            `
          }}
        ></Script>
      </head>
      <body>
        <ReduxProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ReduxProvider>
      </body>
      <GoogleAnalytics gaId="G-4HR9W978KD" />
    </html>
  )
}
