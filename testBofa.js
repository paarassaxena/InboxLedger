const body = "Amount: $16.53\nDate: February 9, 2026\nWhere: AMAZON PRIME PMTS\nView details";

const explicitTableReverseRegex = /(?:Amount|Total|Charge)\s*:?-?\s*\$?([\d,]+(?:\.\d{2})?)[\s\S]{0,150}?(?:Merchant|Description|Payee|Where)\s*:?-?\s*([A-Za-z0-9\s\'&*#.\-\/]{2,50}?)(?:\n|\r|<br>|$)/i;

const match = body.match(explicitTableReverseRegex);
console.log("Reverse match:");
if (match) {
    console.log("Amount:", match[1]);
    console.log("Merchant:", match[2].trim());
} else {
    console.log("null");
}
