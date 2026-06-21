import type { IncomingMessage, ServerResponse } from 'http';
import type { Plugin } from 'vite';
import { ChatApiError, createChatResponse } from './chat';

const readBody = (request: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new ChatApiError('Chat request is too large.', 413));
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });

const sendJson = (response: ServerResponse, status: number, payload: unknown) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
};

export const taskflowApiPlugin = (): Plugin => ({
  name: 'taskflow-api-proxy',
  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const requestUrl = request.url?.split('?')[0];

      if (requestUrl !== '/api/chat') {
        next();
        return;
      }

      if (request.method === 'OPTIONS') {
        response.statusCode = 204;
        response.end();
        return;
      }

      if (request.method !== 'POST') {
        next();
        return;
      }

      try {
        const rawBody = await readBody(request);
        const payload = rawBody ? JSON.parse(rawBody) : {};
        const result = await createChatResponse(payload);
        sendJson(response, 200, result);
      } catch (error) {
        const status = error instanceof ChatApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : 'Assistant request failed.';
        sendJson(response, status, { error: message });
      }
    });
  }
});
