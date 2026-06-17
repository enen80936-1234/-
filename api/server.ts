import express from 'express';
import cors from 'cors';
import handler from './index.js';
import feeRouter from './routes/fee.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/fee', feeRouter);
app.all('/api/*', handler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
