const origError = console.error;
console.error = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('net::ERR_NETWORK_IO_SUSPENDED') ||
    msg.includes('net::ERR_ABORTED') ||
    msg.includes('@vite/client')
  ) {
    return;
  }
  origError(...args);
};
