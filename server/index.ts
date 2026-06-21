import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChatApiError, createChatResponse } from './chat';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT ?? 4173);
const distPath = path.resolve(__dirname, '..', 'dist');

app.use(express.json({ limit: '1mb' }));

app.post('/api/chat', async (request, response) => {
  try {
    const result = await createChatResponse(request.body);
    response.json(result);
  } catch (error) {
    const status = error instanceof ChatApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Assistant request failed.';
    response.status(status).json({ error: message });
  }
});

app.use(express.static(distPath));

app.get('*', (_request, response) => {
  response.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`TaskFlow Pro server listening on http://localhost:${port}`);
});
