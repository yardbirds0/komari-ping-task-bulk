import test from "node:test";
import assert from "node:assert/strict";
import { parseImportText } from "../src/parser.js";

test("parses delimited rows and preserves target separators", () => {
  const rows = parseImportText("Google DNS,8.8.8.8,icmp,60\nWeb,https://example.com,http,30");
  assert.deepEqual(rows.map(({ status, name, target, type, interval }) => ({ status, name, target, type, interval })), [
    { status: "pending", name: "Google DNS", target: "8.8.8.8", type: "icmp", interval: 60 },
    { status: "pending", name: "Web", target: "https://example.com", type: "http", interval: 30 },
  ]);
});

test("accepts JSON aliases and reports invalid fields", () => {
  const rows = parseImportText('[{"名称":"DNS","目标":"1.1.1.1","类型":"icmp","间隔":10},{"name":"bad","target":"x","type":"udp","interval":1}]');
  assert.equal(rows[0].status, "pending");
  assert.match(rows[1].message, /type/);
});

test("reports JSON syntax location", () => {
  const rows = parseImportText('[{"name":"broken"}');
  assert.equal(rows[0].status, "failed");
  assert.match(rows[0].message, /JSON/);
  assert.match(rows[0].near, /\^/);
});
