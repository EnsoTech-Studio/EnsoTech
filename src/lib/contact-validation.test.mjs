import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkLead, normalizePhone } from './contact-validation.ts'

test('số điện thoại Việt Nam', () => {
  assert.equal(normalizePhone('0912 345 678'), '0912345678')
  assert.equal(normalizePhone('+84 364.151.304'), '0364151304')
  assert.equal(normalizePhone('84-364-151-304'), '0364151304')
  assert.equal(normalizePhone('0212345678'), null)
  assert.equal(normalizePhone('12345'), null)
  assert.equal(normalizePhone(undefined), null)
})

test('form hợp lệ, gọn khoảng trắng', () => {
  const r = checkLead({ name: '  Chị   Lan ', phone: '0912345678', need: 'nhập đơn', quick: 'Quản lý bán hàng, kho' })
  assert.deepEqual(r, { ok: true, lead: { name: 'Chị Lan', phone: '0912345678', need: 'nhập đơn', quick: 'Quản lý bán hàng, kho' } })
})

test('thiếu tên, sai số', () => {
  assert.deepEqual(checkLead({ name: ' ', phone: '123' }), { ok: false, errors: { name: true, phone: true } })
  assert.deepEqual(checkLead({ name: 'Lan', phone: '' }), { ok: false, errors: { phone: true } })
})

test('bẫy máy (honeypot)', () => {
  assert.equal(checkLead({ name: 'Lan', phone: '0912345678', website: 'x.com' }).spam, true)
})
