#!/usr/bin/env node
// Deterministic, reproducible packaging tool for the LeaseMind Matching Data
// Contracts v1.0 controlled ZIP (Sprint 7 corrective passes).
//
// Single source of truth: the current contents of
// contract-tests/v1.0/source/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/. This
// tool never edits document statuses, versions, or normative content.
//
// Two-phase lifecycle (integrity corrective pass): the previous single-mode
// build silently recomputed manifest.sha256 as part of packaging, which
// meant the manifest could change *after* synthetic_verification_report.json
// had already captured (and hashed) an earlier manifest -- report.source_
// manifest_sha256 would then be cryptographically stale relative to the
// manifest actually shipped. That circular dependency is now split into two
// explicit steps:
//
//   1. `node build_controlled_zip.mjs --prepare-manifest`
//      Recomputes and writes ONLY manifest.sha256 from the current
//      NORMATIVE_ALLOWLIST content. Does not touch generated evidence
//      (report/log) and does not build a ZIP. Run this BEFORE the canonical
//      verification run (`npm run verify`) so the report that run produces
//      hashes the manifest that will actually ship.
//   2. `node build_controlled_zip.mjs [--out <path>]`
//      The final build. It never writes manifest.sha256 -- it only verifies
//      that the current manifest.sha256 already matches what would be
//      recomputed from the current normative source (fail-closed otherwise,
//      with an explicit instruction to run --prepare-manifest first), then
//      verifies the generated report is internally consistent (PASS status,
//      synthetic-only, no production adapters, exact CT/EV/PG/raw-assertion
//      ID sets all PASS) and cryptographically fresh (report.source_manifest_
//      sha256 and report.postgres.stderr_log_sha256 match the files actually
//      on disk) before packaging.
//
// Fails closed (non-zero exit, no manifest/ZIP mutation) on:
//   - a missing normative allowlisted file;
//   - an unexpected file in the source tree (beyond the normative allowlist,
//     the three generated-evidence files, and manifest.sha256 itself);
//   - (--prepare-manifest) any of the above;
//   - (final build) a stale manifest.sha256 (does not match recomputed
//     content -- must run --prepare-manifest first);
//   - missing or invalid-JSON generated evidence, or a missing required
//     report field/array;
//   - a generated verification report whose status is not "PASS", whose
//     synthetic_data_only is not true, or whose production_adapters_used is
//     not false;
//   - a non-exact, non-unique, or non-all-PASS CT-001..CT-033 / EV-001..
//     EV-007 / PG-001..PG-030 / raw-assertion ID set;
//   - a report.source_manifest_sha256 or report.postgres.stderr_log_sha256
//     that does not match the actual current file on disk (a stale report).
//
// Determinism: entries are added in a fixed, sorted order; every entry uses
// a fixed DOS date/time (1980-01-01 00:00:00, the ZIP format's own epoch
// floor) and fixed external attributes (regular file, rw-r--r--); storage
// method is STORE (no compression), which removes any dependency on zlib's
// internal deflate implementation as a source of run-to-run or
// machine-to-machine byte variation. Running the final build twice against
// an unchanged source tree produces byte-identical ZIP files.
//
// No third-party packages: implemented with only Node's built-in fs/path/
// crypto/url so the tool itself has nothing to `npm install` and nothing to
// pin/audit beyond the Node runtime already required by the rest of the
// package. The one dynamic import (tests/evidence_matrix.mjs, to derive the
// exact expected raw-assertion ID set) is itself dependency-free.

import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, existsSync, readdirSync} from 'node:fs';
import {relative, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const SOURCE_ROOT = resolve(HERE, '../source/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0');
const DEFAULT_OUT_ZIP = resolve(HERE, '../artifacts/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0_EXECUTABLE.zip');
const ZIP_ROOT_PREFIX = 'LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/';
const MANIFEST_FILE = 'manifest.sha256';
const REPORT_FILE = 'synthetic_verification_report.json';
const REPORT_SHA_FILE = 'synthetic_verification_report.sha256';
const POSTGRES_LOG_FILE = 'postgres_execution.log';
const EVIDENCE_MATRIX_FILE = 'tests/evidence_matrix.mjs';

// Exact allowlist of normative source files. This is the content basis of
// manifest.sha256 -- generated evidence and the manifest itself are
// deliberately excluded to avoid a hash self-reference cycle (see
// README.md "Состав").
const NORMATIVE_ALLOWLIST = [
  'README.md',
  'asyncapi.yaml',
  'docs/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md',
  'docs/LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md',
  'fixtures/contract_cases.yaml',
  'fixtures/synthetic_fixtures.mjs',
  'migrations/001_matching_critical_chain.down.sql',
  'migrations/001_matching_critical_chain.up.sql',
  'openapi.yaml',
  'package-lock.json',
  'package.json',
  'requirements.txt',
  'tests/evidence_matrix.mjs',
  'tests/fixtures/dlp_golden_vectors.mjs',
  'tests/local_postgres_nonroot_shim.c',
  'tests/post_down_assertions.sql',
  'tests/postgres_catalog_assertions.sql',
  'tests/run_contract_suite.mjs',
  'tests/run_evidence_self_tests.mjs',
  'tests/run_full_suite.mjs',
  'tests/run_postgres_suite.mjs',
  'tests/run_postgres_tests.sh',
  'tests/synthetic_service_models.mjs',
  'verify_contracts.py'
];

const GENERATED_EVIDENCE = [REPORT_FILE, REPORT_SHA_FILE, POSTGRES_LOG_FILE];

const CT_COUNT = 33;
const EV_COUNT = 7;
const PG_COUNT = 30;

function sha256Hex(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function walkAllFiles(root) {
  const out = [];
  const walk = dir => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(relative(root, full).split('\\').join('/'));
    }
  };
  walk(root);
  return out;
}

function failClosed(message) {
  console.error(`BUILD FAILED (fail-closed): ${message}`);
  process.exit(1);
}

function checkAllowlistAndTree() {
  for (const relPath of NORMATIVE_ALLOWLIST) {
    if (!existsSync(join(SOURCE_ROOT, relPath))) {
      failClosed(`missing normative source file: ${relPath}`);
    }
  }
  const actualFiles = walkAllFiles(SOURCE_ROOT);
  const expectedSet = new Set([...NORMATIVE_ALLOWLIST, ...GENERATED_EVIDENCE, MANIFEST_FILE]);
  const unexpected = actualFiles.filter(f => !expectedSet.has(f));
  if (unexpected.length) {
    failClosed(`unexpected file(s) in source package (not in allowlist, generated evidence, or manifest): ${unexpected.join(', ')}`);
  }
}

// Recompute the manifest content that manifest.sha256 SHOULD contain right
// now, from the current bytes of every normative allowlisted file. Sorted by
// relative path in plain byte/ASCII order (matches the pre-existing
// manifest.sha256 convention).
function computeExpectedManifest() {
  const manifestEntries = NORMATIVE_ALLOWLIST
    .map(relPath => ({relPath, hash: sha256Hex(readFileSync(join(SOURCE_ROOT, relPath)))}))
    .sort((a, b) => (a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0));
  const manifestContent = manifestEntries.map(e => `${e.hash}  ${e.relPath}`).join('\n') + '\n';
  return {manifestEntries, manifestContent};
}

function assertExactIdRange(label, items, prefix, count) {
  if (!Array.isArray(items)) failClosed(`${label}: expected an array`);
  const ids = items.map(t => t.id);
  const idSet = new Set(ids);
  if (idSet.size !== ids.length) {
    failClosed(`${label}: duplicate id(s) detected (${ids.length} entries, ${idSet.size} unique)`);
  }
  const expected = new Set(Array.from({length: count}, (_, i) => `${prefix}-${String(i + 1).padStart(3, '0')}`));
  const missing = [...expected].filter(id => !idSet.has(id));
  const extra = [...idSet].filter(id => !expected.has(id));
  if (missing.length || extra.length) {
    failClosed(`${label}: expected exact set ${prefix}-001..${prefix}-${String(count).padStart(3, '0')} (${count} ids); missing=[${missing.join(',')}] extra=[${extra.join(',')}]`);
  }
  const nonPass = items.filter(t => t.status !== 'PASS');
  if (nonPass.length) {
    failClosed(`${label}: non-PASS entries: ${nonPass.map(t => `${t.id}=${t.status}`).join(', ')}`);
  }
}

function assertExactIdSet(label, items, expectedSet) {
  if (!Array.isArray(items)) failClosed(`${label}: expected an array`);
  const ids = items.map(t => t.id);
  const idSet = new Set(ids);
  if (idSet.size !== ids.length) {
    failClosed(`${label}: duplicate id(s) detected (${ids.length} entries, ${idSet.size} unique)`);
  }
  const missing = [...expectedSet].filter(id => !idSet.has(id));
  const extra = [...idSet].filter(id => !expectedSet.has(id));
  if (missing.length || extra.length) {
    failClosed(`${label}: expected exact derived set (${expectedSet.size} ids); missing=[${missing.join(',')}] extra=[${extra.join(',')}]`);
  }
  const nonPass = items.filter(t => t.status !== 'PASS');
  if (nonPass.length) {
    failClosed(`${label}: non-PASS entries: ${nonPass.map(t => `${t.id}=${t.status}`).join(', ')}`);
  }
}

// The set of CT ids that have their OWN raw offline assertion (as opposed to
// resolving purely from PostgreSQL evidence) is a structural fact of
// tests/evidence_matrix.mjs's CT_EVIDENCE_MATRIX: a CT id has its own raw
// assertion iff its own id appears among its own dependencies. Deriving this
// here (rather than hard-coding a count) means the packaging tool stays
// correct if the dependency matrix ever legitimately changes, while still
// failing closed on any drift between the report and the matrix as it
// stands today (currently 28 of 33 ids).
async function loadExpectedRawAssertionIds() {
  const evidenceMatrixPath = join(SOURCE_ROOT, EVIDENCE_MATRIX_FILE);
  if (!existsSync(evidenceMatrixPath)) {
    failClosed(`cannot derive expected raw-assertion id set: missing ${EVIDENCE_MATRIX_FILE}`);
  }
  const module = await import(pathToFileURL(evidenceMatrixPath).href);
  const matrix = module.CT_EVIDENCE_MATRIX;
  if (!matrix || typeof matrix !== 'object') {
    failClosed(`${EVIDENCE_MATRIX_FILE} did not export CT_EVIDENCE_MATRIX`);
  }
  const ids = Object.entries(matrix)
    .filter(([ctId, deps]) => Array.isArray(deps) && deps.includes(ctId))
    .map(([ctId]) => ctId);
  return new Set(ids);
}

// --- Mode 1: --prepare-manifest -------------------------------------------

function prepareManifest() {
  checkAllowlistAndTree();
  const {manifestEntries, manifestContent} = computeExpectedManifest();
  writeFileSync(join(SOURCE_ROOT, MANIFEST_FILE), manifestContent);
  const manifestHash = sha256Hex(Buffer.from(manifestContent, 'utf8'));
  console.log(JSON.stringify({
    status: 'MANIFEST_PREPARED',
    source_root: SOURCE_ROOT,
    manifest_file: join(SOURCE_ROOT, MANIFEST_FILE),
    manifest_sha256: manifestHash,
    normative_file_count: NORMATIVE_ALLOWLIST.length,
    manifest_entries: manifestEntries.map(e => ({path: e.relPath, sha256: e.hash})),
    next_step: 'Run the canonical verification (npm run verify against a disposable PostgreSQL), then the final build.'
  }, null, 2));
}

// --- Minimal deterministic ZIP writer (STORE method, no compression) ------

function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xEDB88320 & mask);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Fixed reproducible-build timestamp: 1980-01-01 00:00:00, the minimum date
// representable in the DOS date/time fields used by the ZIP format.
const FIXED_DOS_TIME = 0x0000;
const FIXED_DOS_DATE = 0x0021;
// Regular file, rw-r--r--, stored in the high 16 bits of external attrs
// (Unix convention); version made by = spec 2.0 on a Unix host (byte 3 = 3).
const UNIX_FILE_MODE = 0o100644;
const EXTERNAL_ATTRS = (UNIX_FILE_MODE << 16) >>> 0;
const VERSION_MADE_BY = (3 << 8) | 20;
const VERSION_NEEDED = 20;

function buildZipBuffer(entries) {
  // entries: [{name: 'LeaseMind.../file.ext', data: Buffer}], already sorted.
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(VERSION_NEEDED, 4);
    local.writeUInt16LE(0, 6); // general purpose bit flag
    local.writeUInt16LE(0, 8); // compression method: 0 = store
    local.writeUInt16LE(FIXED_DOS_TIME, 10);
    local.writeUInt16LE(FIXED_DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28); // extra field length

    localChunks.push(local, nameBuf, entry.data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(VERSION_MADE_BY, 4);
    central.writeUInt16LE(VERSION_NEEDED, 6);
    central.writeUInt16LE(0, 8); // general purpose bit flag
    central.writeUInt16LE(0, 10); // compression method
    central.writeUInt16LE(FIXED_DOS_TIME, 12);
    central.writeUInt16LE(FIXED_DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(size, 20);
    central.writeUInt32LE(size, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30); // extra field length
    central.writeUInt16LE(0, 32); // file comment length
    central.writeUInt16LE(0, 34); // disk number start
    central.writeUInt16LE(0, 36); // internal file attributes
    central.writeUInt32LE(EXTERNAL_ATTRS, 38);
    central.writeUInt32LE(offset, 42);

    centralChunks.push(central, nameBuf);

    offset += local.length + nameBuf.length + entry.data.length;
  }

  const centralDirStart = offset;
  const centralDirBuffer = Buffer.concat(centralChunks);
  const centralDirSize = centralDirBuffer.length;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4); // number of this disk
  eocd.writeUInt16LE(0, 6); // disk where central directory starts
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirStart, 16);
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localChunks, centralDirBuffer, eocd]);
}

// --- Mode 2: final build ---------------------------------------------------

async function finalBuild(outZipPath) {
  checkAllowlistAndTree();

  for (const relPath of GENERATED_EVIDENCE) {
    if (!existsSync(join(SOURCE_ROOT, relPath))) {
      failClosed(`missing generated evidence file: ${relPath} -- run the canonical verification (npm run verify against a disposable PostgreSQL) first`);
    }
  }

  // manifest.sha256 must already reflect the current normative source
  // content. The final build never recomputes it -- that is --prepare-
  // manifest's job, and it must run strictly before the canonical
  // verification that produces synthetic_verification_report.json.
  const {manifestEntries, manifestContent: expectedManifestContent} = computeExpectedManifest();
  const actualManifestContent = readFileSync(join(SOURCE_ROOT, MANIFEST_FILE), 'utf8');
  if (actualManifestContent !== expectedManifestContent) {
    failClosed(
      `${MANIFEST_FILE} does not reflect the current normative source content -- ` +
      `run "node tools/build_controlled_zip.mjs --prepare-manifest" first, then re-run the canonical ` +
      `verification (npm run verify against a disposable PostgreSQL), then re-run this final build.`
    );
  }
  const actualManifestHash = sha256Hex(readFileSync(join(SOURCE_ROOT, MANIFEST_FILE)));

  let report;
  try {
    report = JSON.parse(readFileSync(join(SOURCE_ROOT, REPORT_FILE), 'utf8'));
  } catch (error) {
    failClosed(`${REPORT_FILE} is not valid JSON: ${error.message}`);
  }

  const requiredFields = [
    'status', 'synthetic_data_only', 'production_adapters_used',
    'contract_tests', 'raw_contract_assertions', 'evidence_policy', 'postgres',
    'source_manifest_sha256'
  ];
  for (const field of requiredFields) {
    if (!(field in report)) failClosed(`${REPORT_FILE} missing required field: ${field}`);
  }
  if (!report.evidence_policy || !Array.isArray(report.evidence_policy.runner_self_tests)) {
    failClosed(`${REPORT_FILE} missing evidence_policy.runner_self_tests array`);
  }
  if (!report.postgres || !Array.isArray(report.postgres.tests)) {
    failClosed(`${REPORT_FILE} missing postgres.tests array`);
  }
  if (typeof report.postgres.stderr_log_sha256 !== 'string' || !report.postgres.stderr_log_sha256) {
    failClosed(`${REPORT_FILE} missing postgres.stderr_log_sha256`);
  }

  if (report.status !== 'PASS') {
    failClosed(`${REPORT_FILE} status is "${report.status}", not PASS -- refusing to package a non-green run`);
  }
  if (report.synthetic_data_only !== true) {
    failClosed(`${REPORT_FILE} synthetic_data_only is not exactly true -- refusing to package`);
  }
  if (report.production_adapters_used !== false) {
    failClosed(`${REPORT_FILE} production_adapters_used is not exactly false -- refusing to package`);
  }

  assertExactIdRange('contract_tests (resolved CT matrix)', report.contract_tests, 'CT', CT_COUNT);
  assertExactIdRange('evidence_policy.runner_self_tests (EV)', report.evidence_policy.runner_self_tests, 'EV', EV_COUNT);
  assertExactIdRange('postgres.tests (PG)', report.postgres.tests, 'PG', PG_COUNT);

  const expectedRawIds = await loadExpectedRawAssertionIds();
  assertExactIdSet('raw_contract_assertions', report.raw_contract_assertions, expectedRawIds);

  // Cryptographic freshness: the report must have been generated against the
  // manifest and log that will actually ship, not an earlier version of them.
  if (report.source_manifest_sha256 !== actualManifestHash) {
    failClosed(
      `${REPORT_FILE}.source_manifest_sha256 (${report.source_manifest_sha256}) does not match the ` +
      `current ${MANIFEST_FILE} (${actualManifestHash}) -- the report is stale relative to the manifest ` +
      `it will be packaged with. Re-run the canonical verification (npm run verify) after preparing the ` +
      `manifest, then rebuild.`
    );
  }
  const actualLogHash = sha256Hex(readFileSync(join(SOURCE_ROOT, POSTGRES_LOG_FILE)));
  if (report.postgres.stderr_log_sha256 !== actualLogHash) {
    failClosed(
      `${REPORT_FILE}.postgres.stderr_log_sha256 (${report.postgres.stderr_log_sha256}) does not match ` +
      `the current ${POSTGRES_LOG_FILE} (${actualLogHash}) -- the report is stale relative to the log it ` +
      `will be packaged with.`
    );
  }

  // Recompute the report sidecar hash from the now-verified-fresh report
  // content. Unlike manifest.sha256 this is a pure derived convenience hash
  // of already-finalized evidence (nothing else depends on it), so
  // recomputing it here is not the "silent source manifest change" this
  // corrective pass forbids.
  const reportBytes = readFileSync(join(SOURCE_ROOT, REPORT_FILE));
  const reportShaLine = `${sha256Hex(reportBytes)}  ${REPORT_FILE}\n`;
  writeFileSync(join(SOURCE_ROOT, REPORT_SHA_FILE), reportShaLine);

  const packagedRelPaths = [
    ...NORMATIVE_ALLOWLIST,
    ...GENERATED_EVIDENCE,
    MANIFEST_FILE
  ].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const entries = packagedRelPaths.map(relPath => ({
    name: `${ZIP_ROOT_PREFIX}${relPath}`,
    data: readFileSync(join(SOURCE_ROOT, relPath))
  }));

  const zipBuffer = buildZipBuffer(entries);
  writeFileSync(outZipPath, zipBuffer);
  const zipHash = sha256Hex(zipBuffer);

  console.log(JSON.stringify({
    status: 'PASS',
    source_root: SOURCE_ROOT,
    out_zip: outZipPath,
    zip_sha256: zipHash,
    zip_size_bytes: zipBuffer.length,
    packaged_file_count: entries.length,
    normative_file_count: NORMATIVE_ALLOWLIST.length,
    manifest_sha256: actualManifestHash,
    raw_contract_assertion_count: expectedRawIds.size,
    contract_test_count: CT_COUNT,
    evidence_self_test_count: EV_COUNT,
    postgres_test_count: PG_COUNT,
    manifest_entries: manifestEntries.map(e => ({path: e.relPath, sha256: e.hash}))
  }, null, 2));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--prepare-manifest')) {
    prepareManifest();
    return;
  }
  const outZipPath = args.includes('--out')
    ? resolve(args[args.indexOf('--out') + 1])
    : DEFAULT_OUT_ZIP;
  await finalBuild(outZipPath);
}

main().catch(error => {
  failClosed(`unexpected error: ${error.stack || error.message}`);
});
