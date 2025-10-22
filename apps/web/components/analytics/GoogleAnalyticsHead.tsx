import Script from "next/script";

export default function GoogleAnalyticsHead() {
  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-7JKBFQ2RHZ" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-7JKBFQ2RHZ');
        `.trim()}
      </Script>
    </>
  );
}
