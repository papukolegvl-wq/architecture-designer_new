const fs = require('fs');
const path = 'c:\\Users\\User\\Downloads\\architecture-designer-main (1)\\architecture-designer-main\\src\\components\\AIAssistantPanel.tsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);
console.log('Total lines:', lines.length);
for (let i = lines.length - 20; i < lines.length; i++) {
    console.log(i + 1, ':', JSON.stringify(lines[i]));
}
// Try to find the line containing <React.Fragment> at the end
for (let i = lines.length - 1; i > lines.length - 100; i--) {
    if (lines[i] && lines[i].includes('<React.Fragment>') && !lines[i].includes('</')) {
        console.log('Found it at line ' + (i + 1) + ': ' + lines[i]);
        lines[i] = lines[i].replace('<React.Fragment>', '</React.Fragment>');
        fs.writeFileSync(path, lines.join('\n'), 'utf8');
        console.log('Fixed!');
        process.exit(0);
    }
}
console.log('Not found via reverse scan');
