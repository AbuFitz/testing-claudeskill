import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Manifesto from './components/Manifesto.jsx';
import Services from './components/Services.jsx';
import Work from './components/Work.jsx';
import Visit from './components/Visit.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <a className="skip" href="#services">
        Skip to the menu
      </a>
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Services />
        <Work />
        <Visit />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
