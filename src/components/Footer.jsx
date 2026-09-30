import Placeholder from './Placeholder.jsx';
import { site } from '../content/site.js';

export default function Footer() {
  return (
    <footer className="foot">
      <p className="foot__big" aria-hidden="true">
        BARBERSPRO
      </p>
      <div className="foot__row">
        <p>
          © {new Date().getFullYear()} {site.name}, {site.town}. <Placeholder>LEGAL ENTITY / COMPANY NUMBER</Placeholder>
        </p>
        <p>
          <Placeholder>PRIVACY POLICY LINK</Placeholder>
        </p>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
