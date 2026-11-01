#!/usr/bin/env node

import { randomBytes, scrypt } from "node:crypto";

try {
  if (process.stdin.isTTY) {
    throw new Error("请通过标准输入提供密码，避免在命令参数或终端中显示明文。");
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > 2048) throw new Error("密码输入过长。");
    chunks.push(chunk);
  }
  const password = Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 1024 || /[\r\n]/.test(password)) {
    throw new Error("请提供至少 12 个字符、最多 1024 字节且不含换行的密码。");
  }

  const salt = randomBytes(16);
  const key = await new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
  process.stdout.write(`scrypt$${salt.toString("hex")}$${key.toString("hex")}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error && /^(请|密码输入)/.test(error.message) ? error.message : "无法生成密码哈希，请重试。"}\n`);
  process.exitCode = 1;
}
