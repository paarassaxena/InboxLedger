const stripHtml = (html) => {
    let text = html.replace(/<[^>]*>?/gm, ' ');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&[a-z]+;/g, '');
    text = text.replace(/\*/g, '');
    return text.replace(/\s+/g, ' ').trim();
};

// Simulate raw email body for BofA
const rawBofa = `
Amount: <b>$16.53</b><br>
Date: <span>February 9, 2026</span><br>
Where: <b>AMAZON PRIME PMTS</b><br>
<a href="#">View details</a>. Have a nice day!
`;

const body = stripHtml(rawBofa);

const explicitTableReverseRegex = /(?:Amount|Total|Charge)\s*:?-?\s*\$?([\d,]+(?:\.\d{2})?)[\s\S]{0,150}?(?:Merchant|Description|Payee|Where)\s*:?-?\s*([A-Za-z0-9\s\'&*#.\-\/]{2,50}?)(?:\s+(?:View|Click|The|This|Date|Amount|Your|Account|Contact|Questions|If|$))/i;

const reverseTableMatch = body.match(explicitTableReverseRegex);
console.log("Reverse Match:", reverseTableMatch ? reverseTableMatch.slice(1) : null);
