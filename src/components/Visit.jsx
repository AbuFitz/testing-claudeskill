import { useState } from 'react';
import Placeholder from './Placeholder.jsx';
import { site, services, days, bookingTarget, phoneHref, buildRequest, requestChannel } from '../content/site.js';

const fieldErr = {
  name: 'Tell us your name.',
  contact: 'Add a phone number or email so the shop can reply.',
};

export default function Visit() {
  const c = site.contact;
  const target = bookingTarget();
  const tel = phoneHref();
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  function onSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = Object.fromEntries(f.entries());
    const errs = {};
    if (!v.name.trim()) errs.name = fieldErr.name;
    if (!v.contact.trim()) errs.contact = fieldErr.contact;
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      e.currentTarget.elements[first]?.focus();
      return;
    }
    const message = buildRequest({ ...v, name: v.name.trim(), contact: v.contact.trim(), note: v.note.trim() });
    const channel = requestChannel(message);
    setResult({ message, channel });
    if (channel) window.open(channel.href, '_blank', 'noopener');
  }

  return (
    <section id="book" className="visit" aria-labelledby="book-h">
      <h2 id="book-h" className="visit__big">
        Book
        <br />
        the chair
      </h2>

      <div className="visit__grid">
        <form className="form" onSubmit={onSubmit} noValidate>
          <p className="label">Booking request</p>
          <div className="field">
            <label htmlFor="f-name">Name</label>
            <input id="f-name" name="name" type="text" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'e-name' : undefined} />
            {errors.name && (
              <p className="err" id="e-name" role="alert">
                {errors.name}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="f-contact">Phone or email</label>
            <input id="f-contact" name="contact" type="text" inputMode="email" aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'e-contact' : undefined} />
            {errors.contact && (
              <p className="err" id="e-contact" role="alert">
                {errors.contact}
              </p>
            )}
          </div>
          <div className="field field--half">
            <div>
              <label htmlFor="f-service">Service</label>
              <select id="f-service" name="service" defaultValue="Not sure yet">
                <option>Not sure yet</option>
                {services.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-day">Preferred day</label>
              <select id="f-day" name="day" defaultValue="Any day">
                {days.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="f-note">Anything else (optional)</label>
            <textarea id="f-note" name="note" rows="3" />
          </div>
          <button className="btn btn--red btn--wide" type="submit">
            Send request
          </button>

          <div className="result" aria-live="polite">
            {result && result.channel && (
              <p>
                Opening {result.channel.kind} with your request.{' '}
                <a href={result.channel.href} target="_blank" rel="noopener noreferrer">
                  Open it again
                </a>
                .
              </p>
            )}
            {result && !result.channel && (
              <div data-testid="not-connected">
                <p>
                  <strong>Not sent.</strong> No booking channel is connected yet, so nothing has been delivered. The shop
                  must add a WhatsApp number, email or booking link in <code>src/content/site.js</code>.
                </p>
                <pre>{result.message}</pre>
              </div>
            )}
          </div>
        </form>

        <div className="details">
          <p className="label">Find the shop</p>
          <dl className="ledger2">
            <div>
              <dt>Address</dt>
              <dd>{c.address || <Placeholder>STREET, LUTON, POSTCODE</Placeholder>}</dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>{c.hours || <Placeholder>OPENING HOURS</Placeholder>}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{tel ? <a href={tel}>{c.phone}</a> : <Placeholder>PHONE NUMBER</Placeholder>}</dd>
            </div>
            <div>
              <dt>Walk-ins</dt>
              <dd>{c.walkIns == null ? <Placeholder>WALK-IN POLICY</Placeholder> : c.walkIns ? 'Welcome' : 'Appointment only'}</dd>
            </div>
            <div>
              <dt>Online booking</dt>
              <dd>
                {c.bookingUrl ? (
                  <a href={target.href} target="_blank" rel="noopener noreferrer">
                    Open booking page
                  </a>
                ) : (
                  <Placeholder>BOOKING LINK</Placeholder>
                )}
              </dd>
            </div>
          </dl>

          <div className="map" role="img" aria-label="Placeholder for a map of the shop location">
            <span className="map__grid" />
            <span className="map__pin" />
            <p>
              [MAP: embed or link once the address is confirmed]
            </p>
          </div>
          {c.mapsUrl ? (
            <a className="btn btn--ink" href={c.mapsUrl} target="_blank" rel="noopener noreferrer">
              Get directions
            </a>
          ) : (
            <span className="btn btn--ink btn--off" aria-disabled="true">
              Get directions <small>(needs address)</small>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
