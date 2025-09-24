require("dotenv").config();
const { execSync } = require("child_process");

const OPENAPI_URL = process.env.OPENAPI_URL;
if (!OPENAPI_URL) {
    console.error("❌ OPENAPI_URL not set in .env");
    process.exit(1);
}

try {
    execSync(`npx openapi-zod-client ${OPENAPI_URL} --output src/api/client.ts`, {
        stdio: "inherit",
    });
    console.log("✅ API client generated successfully.");
} catch (err) {
    console.error("❌ Failed to generate API client:", err);
    process.exit(1);
}
