const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { spawn } = require('child_process');

const TEST_PORT = 3099;
const BASE = `http://127.0.0.1:${TEST_PORT}`;

function request(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const req = http.request(
      { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method: 'GET' },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ statusCode: res.statusCode, body: Buffer.concat(chunks).toString() }));
      }
    );
    req.on('error', reject);
    req.setTimeout(2000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await request('/');
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error('Server did not become ready');
}

describe('server', () => {
  let child;

  before(async () => {
    child = spawn(process.execPath, ['server.js'], {
      cwd: require('path').join(__dirname, '..'),
      env: { ...process.env, PORT: String(TEST_PORT) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    await waitForServer();
  });

  after(() => {
    if (child && child.kill) child.kill('SIGTERM');
  });

  it('serves index.html at GET /', async () => {
    const res = await request('/');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('<!DOCTYPE html>') || res.body.includes('<html'));
  });
});
