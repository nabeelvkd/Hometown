import os from 'os';
import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';

/** IPv4 LAN addresses, so the console shows the URL phones/devices should use. */
function lanAddresses(): string[] {
  const out: string[] = [];
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const i of ifaces ?? []) {
      if (i.family === 'IPv4' && !i.internal) out.push(i.address);
    }
  }
  return out;
}

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = createApp();
  // No host arg => binds 0.0.0.0 (all interfaces), reachable on the LAN.
  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Nattile API on http://localhost:${env.port} (${env.nodeEnv})`);
    for (const ip of lanAddresses()) {
      // eslint-disable-next-line no-console
      console.log(`[server] On your network: http://${ip}:${env.port}/api  (use this in the mobile app)`);
    }
  });

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
