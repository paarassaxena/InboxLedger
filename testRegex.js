const explicitTableRegex = /(?:Merchant|Description|Payee|Where)\s*:?-?\s*([A-Za-z0-9\s\'&*#.\-\/]{2,50}?)\s+[\s\S]{0,150}?(?:Amount|Total|Charge)\s*:?-?\s*\$?([\d,]+(?:\.\d{2})?)/i;

const str1 = "Merchant: AMAZON\nDate: Jan 9\nAmount: ";
console.log(str1.match(explicitTableRegex));

const str2 = "Merchant: AMAZON\nDate: Jan 9\nAmount: $";
console.log(str2.match(explicitTableRegex));

const str3 = "Merchant: AMAZON\nAmount: 12.34";
console.log(str3.match(explicitTableRegex));

