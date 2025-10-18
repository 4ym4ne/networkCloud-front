import assert from "assert";
import { signPayload, jweEncrypt, jweDecrypt, verifyJWS } from "./session";
import type { SessionData } from "./session";

async function run() {
    const data: SessionData = {
        sub: "user-123",
        username: "alice",
        access_token: "atoken",
        refresh_token: "rtoken",
        roles: ["user"],
        expires_at: Date.now() + 1000 * 60 * 60,
    };

    console.log("Signing payload...");
    const jws = await signPayload(data);
    console.log("Signed JWS length:", jws.length);

    console.log("Encrypting JWS to JWE...");
    const jwe = await jweEncrypt(jws);
    console.log("Encrypted JWE length:", jwe.length);

    console.log("Decrypting JWE...");
    const jws2 = await jweDecrypt(jwe);

    console.log("Verifying JWS...");
    const payload = await verifyJWS(jws2);

    assert.strictEqual(payload.sub, data.sub);
    assert.strictEqual(payload.username, data.username);
    assert.strictEqual(payload.access_token, data.access_token);
    assert.strictEqual(payload.refresh_token, data.refresh_token);

    console.log("Roundtrip success: payload verified and matches original.");
}

run().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
});

