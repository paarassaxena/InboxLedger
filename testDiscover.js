const body = "Merchant: APPLE.COM/BILL Date: February 12, 2026 Amount: $2.99 The amount shown might be a pending pre-authorization";
const explicitTableRegex = /(?:Merchant|Description|Payee|Where)\s*:?-?\s*([A-Za-z0-9\s\'&*#.\-\/]{2,50}?)\s+[\s\S]{0,150}?(?:Amount|Total|Charge)\s*:?-?\s*\$?([\d,]+(?:\.\d{2})?)/i;
const tableMatch = body.match(explicitTableRegex);
console.log("Discover Match:", tableMatch ? tableMatch.slice(1) : null);
