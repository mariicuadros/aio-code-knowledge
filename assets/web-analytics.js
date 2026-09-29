/* Website pageviews only; no form contents, custom events or identity attribution. */
(() => {
  if (location.hostname !== 'aio-code.vercel.app') return;
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  window.va('beforeSend', event => {
    if (event.type !== 'pageview') return null;
    try {
      const url = new URL(event.url);
      url.search = '';
      url.hash = '';
      return { ...event, url: url.href };
    } catch { return null; }
  });
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.append(script);
})();
