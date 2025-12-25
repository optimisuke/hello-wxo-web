const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3003;
const PRIVATE_KEY_PATH =
  process.env.PRIVATE_KEY_PATH || path.join(__dirname, "keys/example-jwtRS256.key");
const IBM_PUBLIC_KEY_PATH =
  process.env.IBM_PUBLIC_KEY_PATH || path.join(__dirname, "keys/ibmPublic.key.pub");

function loadKey(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Key file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

const PRIVATE_KEY = loadKey(PRIVATE_KEY_PATH);
const IBM_PUBLIC_KEY = loadKey(IBM_PUBLIC_KEY_PATH);

function createJWT(userId) {
  const userPayload = {
    name: "Anonymous",
    custom_user_id: userId,
  };

  const encrypted = crypto.publicEncrypt(
    {
      key: IBM_PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(JSON.stringify(userPayload), "utf8"),
  );

  const tokenPayload = {
    sub: userId,
    user_payload: encrypted.toString("base64"),
  };

  return jwt.sign(tokenPayload, PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "1h",
  });
}

function send(res, status, body, contentType = "text/plain") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if (req.method === "OPTIONS") {
    return send(res, 204, "");
  }

  if (req.method === "GET" && (pathname === "/token" || pathname === "/createJWT")) {
    const userId = query.user_id || query.userId || `anon-${Math.random().toString(36).slice(2, 10)}`;
    try {
      const token = createJWT(userId);
      return send(res, 200, token);
    } catch (err) {
      return send(res, 500, `Token error: ${err.message}`);
    }
  }

  if (req.method === "GET" && pathname === "/health") {
    return send(res, 200, "ok");
  }

  return send(res, 404, "Not found");
});

server.listen(PORT, () => {
  console.log(`JWT server listening on http://localhost:${PORT}`);
});
