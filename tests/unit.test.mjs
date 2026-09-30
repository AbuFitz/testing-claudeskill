import assert from 'node:assert/strict';
import { site, bookingTarget, phoneHref, buildRequest, requestChannel, services, days } from '../src/content/site.js';

// Nothing supplied by the client is invented: every contact field ships empty.
for (const [k, v] of Object.entries(site.contact)) assert.equal(v, null, `contact.${k} must ship as null`);

assert.deepEqual(bookingTarget(), { href: '#book', external: false }, 'falls back to the booking section');
assert.deepEqual(bookingTarget({ bookingUrl: 'https://example.test/b' }), { href: 'https://example.test/b', external: true });

assert.equal(phoneHref(), null, 'no tel: link without a phone number');
assert.equal(phoneHref({ phone: '+44 (0)1582 000 000' }), 'tel:+4401582000000');

const msg = buildRequest({ name: 'Sam', contact: 'sam@x.test', service: 'Haircut', day: 'Sat', note: '' });
assert.match(msg, /Name: Sam/);
assert.doesNotMatch(msg, /Note:/, 'empty note is omitted');

assert.equal(requestChannel(msg, {}), null, 'no channel connected means nothing is claimed as sent');
assert.equal(requestChannel(msg, { email: 'a@b.test' }).kind, 'email');
assert.match(requestChannel(msg, { whatsapp: '447000000000', email: 'a@b.test' }).href, /^https:\/\/wa\.me\/447000000000\?text=/);

assert.ok(services.length >= 4 && new Set(services.map((s) => s.id)).size === services.length, 'service ids unique');
assert.equal(days[0], 'Any day');
console.log('unit tests passed');
