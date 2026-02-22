const strings = [
    "12.34",
    "1,000.00",
    ",",
    "0",
    "NaN",
    "undefined",
    "null"
];

for (const s of strings) {
    if (s) {
        let v = parseFloat(s.replace(/,/g, ''));
        console.log(`String: '${s}', Value: ${v}, Element: ${v === v ? v : 'NaN'}`);
    }
}
