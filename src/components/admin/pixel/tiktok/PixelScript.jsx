import Script from 'next/script'

function PixelScript({ id }) {
  return (
    <Script
      id={`TiktokPixel-${id}`}
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(w, d, t) {
            w.TiktokAnalyticsObject = t;
            var ttq = w[t] = w[t] || [];
            ttq.methods = [
              "page", "track", "identify", "instances", "debug", "on", "off", 
              "once", "ready", "alias", "group", "enableCookie", "disableCookie", 
              "holdConsent", "revokeConsent", "grantConsent"
            ];
            ttq.setAndDefer = function(t, e) {
              t[e] = function() {
                t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
              };
            };
            for (var i = 0; i < ttq.methods.length; i++) {
              ttq.setAndDefer(ttq, ttq.methods[i]);
            }
            ttq.instance = function(t) {
              var e = ttq._i[t] || [];
              for (var n = 0; n < ttq.methods.length; n++) {
                ttq.setAndDefer(e, ttq.methods[n]);
              }
              return e;
            };
            ttq.load = function(e, n) {
              var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
              var o = n && n.partner;
              ttq._i = ttq._i || {};
              ttq._i[e] = [];
              ttq._i[e]._u = r;
              ttq._t = ttq._t || {};
              ttq._t[e] = +new Date;
              ttq._o = ttq._o || {};
              ttq._o[e] = n || {};
              n = document.createElement("script");
              n.type = "text/javascript";
              n.async = !0;
              n.src = r + "?sdkid=" + e + "&lib=" + t;
              e = document.getElementsByTagName("script")[0];
              e.parentNode.insertBefore(n, e);
            };
            ttq.load('${id}');
            ttq.page();
          }(window, document, 'ttq');
        `,
      }}
    />
  );
}


export default PixelScript