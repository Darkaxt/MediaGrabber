const {test} = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {getDefaultDownloadDir} = require('../dist/paths.js');

test('Windows redirected Downloads is respected, including Unicode and spaces', {skip:process.platform !== 'win32'}, t => {
  t.mock.method(childProcess, 'execFileSync', () => Buffer.from('D:\\Téléchargements 家\\My files').toString('base64'));
  t.mock.method(fs, 'statSync', () => ({isDirectory:()=>true}));
  assert.equal(getDefaultDownloadDir(), 'D:\\Téléchargements 家\\My files');
});

test('a changed Windows Downloads setting is resolved again', {skip:process.platform !== 'win32'}, t => {
  let directory = 'D:\\Downloads';
  t.mock.method(childProcess, 'execFileSync', () => Buffer.from(directory).toString('base64'));
  t.mock.method(fs, 'statSync', () => ({isDirectory:()=>true}));
  assert.equal(getDefaultDownloadDir(), directory);
  directory = 'G:\\Moved Downloads';
  assert.equal(getDefaultDownloadDir(), directory);
});

test('failed Windows lookup does not fall back to the profile Downloads', {skip:process.platform !== 'win32'}, t => {
  t.mock.method(childProcess, 'execFileSync', () => {throw new Error('Shell lookup failed');});
  assert.throws(() => getDefaultDownloadDir(), /Windows Downloads folder/);
});

test('unavailable configured Downloads does not create another folder', {skip:process.platform !== 'win32'}, t => {
  t.mock.method(childProcess, 'execFileSync', () => Buffer.from('Z:\\Offline Downloads').toString('base64'));
  t.mock.method(fs, 'statSync', () => {throw new Error('ENOENT');});
  const create = t.mock.method(fs, 'mkdirSync');
  assert.throws(() => getDefaultDownloadDir(), /Windows Downloads folder/);
  assert.equal(create.mock.callCount(), 0);
});

test('the actual Windows known folder agrees with the registered system setting', {skip:process.platform !== 'win32'}, () => {
  const output = childProcess.execFileSync('reg.exe', ['query',
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders',
    '/v', '{374DE290-123F-4565-9164-39C4925E467B}'], {encoding:'utf8',windowsHide:true});
  const registered = output.match(/REG_(?:EXPAND_)?SZ\s+(.+)/)[1].trim()
    .replace(/%([^%]+)%/g, (_, key) => process.env[key] || `%${key}%`);
  assert.equal(path.normalize(getDefaultDownloadDir()).toLowerCase(), path.normalize(registered).toLowerCase());
});
