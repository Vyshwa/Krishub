const origError = console.error;
console.error = (...args) => {
  const toStr = (v) => {
    if (typeof v === 'string') return v;
    if (v && typeof v.message === 'string') return v.message;
    try {
      return String(v);
    } catch {
      return '';
    }
  };
  const blob = args.map(toStr).join(' ');
  const ignore = [
    'net::ERR_NETWORK_IO_SUSPENDED',
    'net::ERR_ABORTED',
    '@vite/client'
  ];
  if (ignore.some((p) => blob.includes(p))) {
    return;
  }
  origError(...args);
};

// Suppress errors from browser extensions (content-link.js, brg.js, content.js, etc.)
window.addEventListener('error', (e) => {
  const src = e.filename || '';
  if (src.startsWith('chrome-extension://') || src.startsWith('moz-extension://') || src.includes('content-link.js') || src.includes('brg.js')) {
    e.preventDefault();
  }
});
