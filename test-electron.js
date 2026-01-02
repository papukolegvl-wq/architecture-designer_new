const electron = require('electron');
console.log('Type of electron:', typeof electron);
console.log('Value of electron:', electron);
try {
    const { app } = electron;
    console.log('Type of app:', typeof app);
} catch (e) {
    console.log('Error accessing app:', e.message);
}
