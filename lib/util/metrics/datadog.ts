import dgram from 'node:dgram';
import { GlobalConfig } from '../../config/global';

function formatTags(tags: Record<string, string>): string {
  const tagStr = Object.entries(tags)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}:${v}`)
    .join(',');
  return tagStr ? `|#${tagStr}` : '';
}

function send(message: string): void {
  const cfg = GlobalConfig.get();
  if (!cfg.datadogEnabled) {
    return;
  }
  const host = cfg.datadogHost || 'localhost';
  const port = cfg.datadogPort || 8125;
  const socket = dgram.createSocket('udp4');
  socket.send(message, port, host, () => {
    socket.close();
  });
}

export function incrementMetric(
  name: string,
  value = 1,
  tags: Record<string, string> = {},
): void {
  send(`${name}:${value}|c${formatTags(tags)}`);
}

export function gaugeMetric(
  name: string,
  value: number,
  tags: Record<string, string> = {},
): void {
  send(`${name}:${value}|g${formatTags(tags)}`);
}
