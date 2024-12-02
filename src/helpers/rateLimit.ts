import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { getIp, sendError, sha256 } from './utils';

let client;

(async () => {
  if (!process.env.RATE_LIMIT_DATABASE_URL) return;

  console.log('[redis-rl] Connecting to Redis');
  client = createClient({ url: process.env.RATE_LIMIT_DATABASE_URL });
  client.on('connect', () => console.log('[redis-rl] Redis connect'));
  client.on('ready', () => console.log('[redis-rl] Redis ready'));
  client.on('reconnecting', err =>
    console.log('[redis-rl] Redis reconnecting', err)
  );
  client.on('error', err => console.log('[redis-rl] Redis error', err));
  client.on('end', err => console.log('[redis-rl] Redis end', err));
  await client.connect();
})();

const hashedIp = (req): string => sha256(getIp(req)).slice(0, 7);

export default rateLimit({
  windowMs: 60 * 1e3,
  max: 100,
  keyGenerator: req => hashedIp(req),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    if (!client?.isReady) return true;

    // TODO: rate limited
    const apiKey: any = req.headers['x-api-key'] || req.query.apiKey;
    console.log('apiKey:', apiKey);
    let whiteList = ['https://snapshot.osp.org'];
    let apiKeyList = ['osp_snapshot_apiKey'];
    const origin = req.headers['origin'];
    if (origin && whiteList.includes(origin)) return true;
    if (apiKey && apiKeyList.includes(apiKey)) return true;

    return false;
  },
  handler: (req, res) => {
    // log.info(`too many requests ${hashedIp(req)}`);
    sendError(
      res,
      'too many requests, refer to https://docs.snapshot.org/tools/api/api-keys#limits',
      429
    );
  },
  store: client
    ? new RedisStore({
        sendCommand: (...args: string[]) => client.sendCommand(args),
        prefix: 'snapshot-hub:'
      })
    : undefined
});
