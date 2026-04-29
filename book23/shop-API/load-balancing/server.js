const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
   res.json({
      //message: 'Response from backend server',
      server: process.env.SERVER_ID || 'unknown',
      port: PORT,
      timestamp: new Date().toISOString()
   });
});

// Проверка маршрута health-check
app.get('/health', (req, res) => {
   res.status(200).send('OK');
});

app.listen(PORT, '0.0.0.0', () => {
   console.log(`Backend server started on port ${PORT}`); // -> http://localhost:PORT
});