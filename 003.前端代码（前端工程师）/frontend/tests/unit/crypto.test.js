/**
 * crypto.js 单元测试
 *
 * 被测文件: js/crypto.js (Web Crypto API)
 * 关键行为: sha256 总是返回64字符十六进制; 确定性的; hashPassword = sha256(pw+salt)
 */
import { describe, it, expect } from 'vitest';
import { sha256, generateSalt, hashPassword } from '../../js/crypto.js';

describe('sha256', () => {
  it('总是返回64字符十六进制', async () => {
    const r1 = await sha256('hello');
    const r2 = await sha256('');
    const r3 = await sha256('a'.repeat(1000));
    expect(r1).toHaveLength(64);
    expect(r2).toHaveLength(64);
    expect(r3).toHaveLength(64);
  });

  it('相同输入产生相同hash (确定性)', async () => {
    const h1 = await sha256('abc');
    const h2 = await sha256('abc');
    expect(h1).toBe(h2);
  });

  it('不同输入产生不同hash', async () => {
    const h1 = await sha256('hello1');
    const h2 = await sha256('hello2');
    expect(h1).not.toBe(h2);
  });
});

describe('generateSalt', () => {
  it('生成32字符十六进制', () => {
    const salt = generateSalt();
    expect(salt).toHaveLength(32);
    expect(/^[0-9a-f]+$/.test(salt)).toBe(true);
  });

  it('100次无碰撞', () => {
    const salts = new Set();
    for (let i = 0; i < 100; i++) salts.add(generateSalt());
    expect(salts.size).toBe(100);
  });
});

describe('hashPassword', () => {
  it('相同password+salt → 相同hash', async () => {
    const h1 = await hashPassword('mypw', 'abcd1234');
    const h2 = await hashPassword('mypw', 'abcd1234');
    expect(h1).toBe(h2);
  });

  it('不同password → 不同hash', async () => {
    const h1 = await hashPassword('pw1', 'salt');
    const h2 = await hashPassword('pw2', 'salt');
    expect(h1).not.toBe(h2);
  });
});
