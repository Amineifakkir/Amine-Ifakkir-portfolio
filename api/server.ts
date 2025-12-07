import { VercelRequest, VercelResponse } from '@vercel/node';
import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const distFolder = join(process.cwd(), 'dist/andresjosehr-portfolio/browser');
  const serverDistFolder = join(process.cwd(), 'dist/andresjosehr-portfolio/server');
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? join(distFolder, 'index.original.html')
    : join(distFolder, 'index.html');

  // Serve static files - these should be handled by Vercel's static file serving
  if (req.url && req.url.match(/\.(js|css|woff|woff2|ttf|eot|png|jpg|jpeg|gif|svg|ico|webp|xml|txt|json|webmanifest)/)) {
    return res.status(404).send('Not found');
  }

  try {
    // Load the built server module
    const serverMainPath = join(serverDistFolder, 'server.js');
    const serverMain = require(serverMainPath);
    const AppServerModule = serverMain.default || serverMain.AppServerModule || serverMain;

    const commonEngine = new CommonEngine();
    
    // Get the full URL for SSR
    const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
    const host = (req.headers.host as string) || (req.headers['x-forwarded-host'] as string) || 'localhost';
    const url = `${protocol}://${host}${req.url || '/'}`;

    // Render the Angular app
    const html = await commonEngine.render({
      bootstrap: AppServerModule,
      documentFilePath: indexHtml,
      url: url,
      publicPath: distFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: req.url || '/' }],
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    console.error('Error details:', {
      distFolder,
      serverDistFolder,
      indexHtml: existsSync(indexHtml),
      url: req.url
    });
    res.status(500).send(`<html><body><h1>Server Error</h1><pre>${(error as Error).message}\n${(error as Error).stack}</pre></body></html>`);
  }
}
