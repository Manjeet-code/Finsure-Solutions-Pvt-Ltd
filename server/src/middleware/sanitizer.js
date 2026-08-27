/**
 * Input sanitization middleware to prevent XSS attacks and NoSQL Injection ($where, $gt, etc.)
 */
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    // Strip HTML tags and script tags
    let clean = val.replace(/<[^>]*>?/gm, '');
    // Prevent Mongo operator injections if string starts with $
    if (clean.startsWith('$')) {
      clean = clean.replace(/^\$/, '');
    }
    return clean;
  }
  if (typeof val === 'object' && val !== null) {
    if (Array.isArray(val)) {
      return val.map(sanitizeValue);
    }
    const cleanObj = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        const cleanKey = key.startsWith('$') ? key.replace(/^\$/, '') : key;
        cleanObj[cleanKey] = sanitizeValue(val[key]);
      }
    }
    return cleanObj;
  }
  return val;
};

export const sanitizeInputs = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        req.query[key] = sanitizeValue(req.query[key]);
      }
    }
  }
  if (req.params && typeof req.params === 'object') {
    for (const key in req.params) {
      if (Object.prototype.hasOwnProperty.call(req.params, key)) {
        req.params[key] = sanitizeValue(req.params[key]);
      }
    }
  }
  next();
};
