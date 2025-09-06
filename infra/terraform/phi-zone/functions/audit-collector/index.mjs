import crypto from "crypto";
export const handler = async (event) => {
  const now = Date.now();
  const body = typeof event.body === "string" ? event.body : JSON.stringify(event.body || {});
  const secret = process.env.AUDIT_LOG_SECRET || "";
  const sig = secret ? crypto.createHmac("sha256", secret).update(body).digest("hex") : "";
  const bucket = process.env.AUDIT_BUCKET;
  const prefix = process.env.AUDIT_PREFIX || "audit/";
  const key = `${prefix}${now}-${Math.random().toString(36).slice(2)}.json`;
  const AWS = await import("aws-sdk");
  const s3 = new AWS.S3({ signatureVersion: "v4" });
  await s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: "application/json",
    ServerSideEncryption: "aws:kms",
    SSEKMSKeyId: process.env.AUDIT_KMS_KEY_ID
  }).promise();
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ ok: true, sig }) };
};
