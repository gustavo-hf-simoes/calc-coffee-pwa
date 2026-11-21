/**
 * Calc Coffee - Test Harness & Mock Utilities
 * Fornece isolamento de ambiente, mock de localStorage e runner unificado
 */

const assert = require("assert");

function createMockStorage() {
  let store = {};
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    _dump: () => ({ ...store })
  };
}

function createSuiteRunner(suiteTitle) {
  const tests = [];

  function test(description, fn) {
    tests.push({ description, fn });
  }

  async function run() {
    console.log(`\n--- ${suiteTitle} ---`);
    let passed = 0;
    let failed = 0;

    for (const t of tests) {
      try {
        if (t.fn.length > 0) {
          await new Promise((resolve, reject) => {
            t.fn((err) => (err ? reject(err) : resolve()));
          });
        } else {
          const res = t.fn();
          if (res && typeof res.then === "function") {
            await res;
          }
        }
        console.log(`  ✓ PASS: ${t.description}`);
        passed++;
      } catch (err) {
        console.error(`  ✗ FAIL: ${t.description}`);
        console.error(`    Erro: ${err.message}`);
        failed++;
      }
    }

    return { total: tests.length, passed, failed };
  }

  return { test, run };
}

module.exports = {
  assert,
  createMockStorage,
  createSuiteRunner
};
