(async () => {
  try {
    const crypto = require('crypto');
    const { logger } = require('../src/lib/logger');

    const SESSION_SECRET = process.env.SESSION_SECRET;
    if (!SESSION_SECRET) {
      throw new Error('Please set SESSION_SECRET env var (min 32 chars)');
    }
    if (SESSION_SECRET.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters');
    }

    const { SignJWT, CompactEncrypt, compactDecrypt, jwtVerify } = await import('jose');

    const MASTER_SECRET = Buffer.from(SESSION_SECRET, 'utf8');
    const SIGNING_KEY_BYTES = Buffer.from(crypto.hkdfSync('sha256', MASTER_SECRET, Buffer.from('session-sign-salt'), Buffer.from('session-sign'), 32));
    const ENCRYPTION_KEY_BYTES = Buffer.from(crypto.hkdfSync('sha256', MASTER_SECRET, Buffer.from('session-enc-salt'), Buffer.from('session-enc'), 32));

    const SIGNING_KEY = crypto.createSecretKey(SIGNING_KEY_BYTES);
    const ENC_KEY = crypto.createSecretKey(ENCRYPTION_KEY_BYTES);

    const payload = {
      sub: 'user-123',
      username: 'alice',
      access_token: 'atoken',
      refresh_token: 'rtoken',
      roles: ['user'],
      expires_at: Date.now() + 1000 * 60 * 60
    };

    const SESSION_TTL = 60 * 60 * 24;

    logger.info('Signing payload...');
    const jws = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL)
      .sign(SIGNING_KEY);

    logger.info('Encrypting JWS to JWE...');
    const jwe = await new CompactEncrypt(Buffer.from(jws, 'utf8'))
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM', typ: 'JWE' })
      .encrypt(ENC_KEY);

    logger.info('Decrypting JWE...');
    const { plaintext } = await compactDecrypt(jwe, ENC_KEY);
    const jws2 = Buffer.from(plaintext).toString('utf8');

    logger.info('Verifying JWS...');
    const { payload: verified } = await jwtVerify(jws2, SIGNING_KEY);

    logger.info('Verified payload:', verified);
    logger.info('Roundtrip success');
  } catch (err) {
    logger.error('Roundtrip failed:', err);
    process.exit(1);
  }
})();
