import assert from "assert";
import { signPayload, jweEncrypt, jweDecrypt, verifyJWS } from "./session";
import type { SessionData } from "./session";
import { logger } from "@/lib/logger";

async function run() {
    const data: SessionData = {
        sub: "user-123",
        username: "alice",
        access_token: "atoken",
        refresh_token: "rtoken",
        roles: ["user"],
        expires_at: Date.now() + 1000 * 60 * 60,
    };

    logger.info("Signing payload...");
    const jws = await signPayload(data);
    logger.info("Signed JWS length:", jws.length);

    logger.info("Encrypting JWS to JWE...");
    const jwe = await jweEncrypt(jws);
    logger.info("Encrypted JWE length:", jwe.length);

    logger.info("Decrypting JWE...");
    const jws2 = await jweDecrypt(jwe);

    logger.info("Verifying JWS...");
    const payload = await verifyJWS(jws2);

    assert.strictEqual(payload.sub, data.sub);
    assert.strictEqual(payload.username, data.username);
    assert.strictEqual(payload.access_token, data.access_token);
    assert.strictEqual(payload.refresh_token, data.refresh_token);

    logger.info("Roundtrip success: payload verified and matches original.");
}

run().catch((err) => {
    logger.error("Test failed:", err);
    process.exit(1);
});
