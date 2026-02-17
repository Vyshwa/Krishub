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
