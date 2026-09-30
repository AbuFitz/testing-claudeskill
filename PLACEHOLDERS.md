# Client handoff: what is missing

Nothing below was invented. Each item is a visible placeholder on the page until supplied.
Edit `src/content/site.js` (contact, legal) and the components noted.

| Item | Where it shows | Set in |
|---|---|---|
| Street address, postcode | Visit block | `contact.address` |
| Opening hours | Visit block | `contact.hours` |
| Phone number (enables the "Call the shop" CTA) | Hero CTA, Visit block | `contact.phone` |
| Online booking URL (every "Book a chair" then goes there) | Header, hero, dock, Visit | `contact.bookingUrl` |
| WhatsApp number or email (makes the request form actually send) | Booking form | `contact.whatsapp` / `contact.email` |
| Walk-in policy | Visit block | `contact.walkIns` |
| Map / directions link | Visit block | `contact.mapsUrl` |
| Instagram | not shown yet | `contact.instagram` (add a link where wanted) |
| Services offered, duration, price | Menu. Names are typical barbershop names, NOT confirmed. Prices and times show as dashes. | `services` in `site.js` |
| About the shop, 2-3 sentences | Manifesto section | `Manifesto.jsx` |
| Real photos with permission (5 slots) | Work strip | `Work.jsx` |
| Real reviews with names and permission | Work strip, last panel | `Work.jsx` |
| Legal entity / company number, privacy policy | Footer | `Footer.jsx`, `legal` |
| Social share image | none set | add `og:image` in `index.html` |

## Deliberately absent until facts exist
- Structured data (LocalBusiness schema): needs a verified address, phone and hours.
- Review ratings, awards, years in business, team names.
- Booking form delivery: until a channel is configured the form says **"Not sent"** and shows the drafted message. It never pretends to submit.

## Before launch
1. Fill the table, then search the built page for `[` to confirm no placeholder remains.
2. Test the real booking link, phone link and WhatsApp/email hand-off on a phone.
3. Profile the 3D hero on a real mid-range phone.
4. Add a hosting fallback/404 rule if the host needs one (single page, no router).
