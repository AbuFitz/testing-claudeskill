// Single source of truth for everything the client must confirm.
// `null` means "not supplied". The UI renders a clearly marked placeholder
// and never invents a value. Fill these in and the page reconnects itself.
export const site = {
  name: 'BarbersPro',
  town: 'Luton',
  // Real destinations. Leave null until confirmed and tested.
  contact: {
    bookingUrl: null, // e.g. an online booking link
    phone: null, // e.g. '+44 ...'
    email: null, // used by the request form when set
    whatsapp: null, // digits only, e.g. '44...'
    instagram: null,
    address: null, // full street address
    mapsUrl: null, // directions link
    hours: null, // e.g. 'Mon-Sat 9-6'
    walkIns: null, // true / false once known
  },
  legal: { entity: null, privacyUrl: null },
};

// Typical barbershop menu names, NOT confirmed. Times and prices are unknown.
export const services = [
  { id: 'haircut', name: 'Haircut', note: 'Scissors or clippers, finished clean.' },
  { id: 'fade', name: 'Skin fade', note: 'Blended down to the skin.' },
  { id: 'beard', name: 'Beard trim', note: 'Shape, line and tidy.' },
  { id: 'shave', name: 'Hot towel shave', note: 'Straight razor, warm towel.' },
  { id: 'kids', name: 'Kids cut', note: 'Junior chair.' },
  { id: 'combo', name: 'Cut and beard', note: 'Both in one visit.' },
];

export const days = ['Any day', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Where the primary CTA goes. Real URL if supplied, otherwise the booking section.
export function bookingTarget(contact = site.contact) {
  if (contact.bookingUrl) return { href: contact.bookingUrl, external: true };
  return { href: '#book', external: false };
}

export function phoneHref(contact = site.contact) {
  if (!contact.phone) return null;
  return 'tel:' + contact.phone.replace(/[^\d+]/g, '');
}

// Build the message the request form would send. Pure, so it can be tested.
export function buildRequest({ name, contact, service, day, note }) {
  return [
    `Booking request for ${site.name}`,
    `Name: ${name}`,
    `Phone or email: ${contact}`,
    `Service: ${service}`,
    `Preferred day: ${day}`,
    note ? `Note: ${note}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

// Returns the real channel the request can go to, or null when none is connected.
export function requestChannel(message, c = site.contact) {
  const enc = encodeURIComponent(message);
  if (c.whatsapp) return { kind: 'WhatsApp', href: `https://wa.me/${c.whatsapp}?text=${enc}` };
  if (c.email) return { kind: 'email', href: `mailto:${c.email}?subject=${encodeURIComponent('Booking request')}&body=${enc}` };
  return null;
}
