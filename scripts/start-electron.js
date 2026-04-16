const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

const env = { ...process.env };
// Critical fix: Ensure Electron runs as Electron, not Node
delete env.ELECTRON_RUN_AS_NODE;

console.log('Starting Electron with cleaned environment...');

const child = spawn(electron, ['.', '--no-sandbox'], {
    stdio: 'inherit',
    env: env,
    cwd: path.resolve(__dirname, '..')
});

child.on('close', (code) => {
    console.log(`Electron exited with code ${code}`);
    process.exit(code);
});
