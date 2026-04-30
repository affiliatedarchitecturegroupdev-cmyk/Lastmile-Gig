import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (req, res) => {
  res.json({ 
    service: 'LASTMILE GIG API Gateway',
    version: '1.0.0',
    endpoints: [
      '/health',
      '/api/v1/auth',
      '/api/v1/orders',
      '/api/v1/drivers',
      '/api/v1/partners'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 LASTMILE GIG API Gateway running on port ${PORT}`);
});

export default app;