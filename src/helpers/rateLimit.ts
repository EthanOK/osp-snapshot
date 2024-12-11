import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from './redis';
import { getIp, sendError, sha256 } from './utils';

const hashedIp = (req): string => sha256(getIp(req)).slice(0, 7);

export default rateLimit({
  windowMs: 60 * 1e3,
  max: 100,
  keyGenerator: req => hashedIp(req),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    if (!redisClient?.isReady) return true;
    // TODO: rate limited
    const apiKey: any = req.headers['x-api-key'] || req.query.apiKey;
    const origin = req.headers['origin'];
    const whitelistOrigins = process.env.WHITELIST_ORIGINS
      ? JSON.parse(process.env.WHITELIST_ORIGINS)
      : [];
    const whitelistApiKeys = process.env.WHITELIST_API_KEYS
      ? JSON.parse(process.env.WHITELIST_API_KEYS)
      : [];
    if (origin && whitelistOrigins.includes(origin)) {
      console.log(`[rate-limit] ${origin} in whitelistOrigins`);
      return true;
    }
    if (apiKey && whitelistApiKeys.includes(apiKey)) {
      console.log(`[rate-limit] ${apiKey} in whitelistApiKeys`);
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    sendError(
      res,
      'too many requests, refer to https://docs.snapshot.org/tools/api/api-keys#limits',
      429
    );
  },
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        prefix: process.env.RATE_LIMIT_KEYS_PREFIX || 'snapshot-sequencer:'
      })
    : undefined
});
