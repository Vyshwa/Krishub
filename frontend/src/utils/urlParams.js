// Utility functions for parsing and managing URL parameters
// Works with both hash-based and browser-based routing

export function getUrlParameter(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  const regularParam = urlParams.get(paramName);
  if (regularParam !== null) {
    return regularParam;
  }
  const hash = window.location.hash;
  const queryStartIndex = hash.indexOf('?');
  if (queryStartIndex !== -1) {
    const hashQuery = hash.substring(queryStartIndex + 1);
    const hashParams = new URLSearchParams(hashQuery);
    return hashParams.get(paramName);
  }
  return null;
}

export function storeSessionParameter(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to store session parameter ${key}:`, error);
  }
}

export function getSessionParameter(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to retrieve session parameter ${key}:`, error);
    return null;
  }
}

export function getPersistedUrlParameter(paramName, storageKey) {
  const key = storageKey || paramName;
  const urlValue = getUrlParameter(paramName);
  if (urlValue !== null) {
    storeSessionParameter(key, urlValue);
    return urlValue;
  }
  return getSessionParameter(key);
}

function clearParamFromHash(paramName) {
  if (!window.history.replaceState) {
    return;
  }
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) {
    return;
  }
  const hashContent = hash.substring(1);
  const queryStartIndex = hashContent.indexOf('?');
  if (queryStartIndex === -1) {
    return;
  }
  const routePath = hashContent.substring(0, queryStartIndex);
  const queryString = hashContent.substring(queryStartIndex + 1);
  const params = new URLSearchParams(queryString);
  params.delete(paramName);
  const newQueryString = params.toString();
  let newHash = routePath;
  if (newQueryString) {
    newHash += '?' + newQueryString;
  }
  const newUrl = window.location.pathname + window.location.search + (newHash ? '#' + newHash : '');
  window.history.replaceState(null, '', newUrl);
}

export function getSecretFromHash(paramName) {
  const existingSecret = getSessionParameter(paramName);
  if (existingSecret !== null) {
    return existingSecret;
  }
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) {
    return null;
  }
  const hashContent = hash.substring(1);
  const params = new URLSearchParams(hashContent);
  const secret = params.get(paramName);
  if (secret) {
    storeSessionParameter(paramName, secret);
    clearParamFromHash(paramName);
    return secret;
  }
  return null;
}

export function getSecretParameter(paramName) {
  return getSecretFromHash(paramName);
}
