const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
   res.json({
      message: 'Response from backend server',
      port: PORT,
      timestamp: new Date().toISOString()
   });
});

// Проверка маршрута health-check
app.get('/health', (req, res) => {
   res.status(200).send('OK');
});

app.listen(PORT, () => {
   console.log(`Backend server started on port ${PORT}`); // -> http://localhost:PORT
});