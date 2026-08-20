import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Backend server running on port ${config.port} in ${config.env} mode`);
});
