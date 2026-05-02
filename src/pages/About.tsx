import { ArrowUpRight, Compass, Gem, Globe2, Plane, Sparkles, UsersRound } from "lucide-react";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";

const values = [
  { icon: Compass, title: "Vision claire", text: "Chaque itineraire est construit avec une logique simple: moins de friction, plus de moments forts." },
  { icon: Gem, title: "Selection premium", text: "Hotels, guides et experiences sont choisis pour leur qualite reelle, pas pour remplir une brochure." },
  { icon: UsersRound, title: "Equipe proche", text: "Les conseillers suivent les dossiers comme des projets vivants, du devis jusqu'au retour." },
];

export default function About() {
  return (
    <main className="static-page about-page">
      <Navbar />
      <section className="about-hero">
        <div className="about-copy">
          <span className="label">A propos</span>
          <h1>Une agence qui transforme le voyage en experience precise.</h1>
          <p>Hamdi Voyage melange exigence, sens du detail et outils modernes pour creer des sejours beaux a regarder, simples a vendre, faciles a suivre.</p>
          <a href="/agencedevoyage.github.io/#tours">Voir les voyages <ArrowUpRight size={17} /></a>
        </div>
        <div className="about-collage">
          <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900" alt="Voyage nature" />
          <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700" alt="Plage premium" />
          <div><Sparkles /><strong>18 ans</strong><span>d'expertise voyage</span></div>
        </div>
      </section>

      <section className="about-values">
        {values.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={26} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="about-story">
        <div>
          <span className="label">Notre methode</span>
          <h2>Du reve au depart, tout est orchestre.</h2>
        </div>
        <div className="timeline">
          {[
            ["01", "Ecoute", "Budget, envie, rythme, contraintes: on part du client."],
            ["02", "Design du sejour", "Vols, hotels, transferts, activites et marges de confort."],
            ["03", "Suivi", "Reservation, documents, assistance et historique equipe."],
          ].map(([n, title, text]) => (
            <article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="about-band">
        <Plane />
        <div className="about-band-track">
          <h2>150+ destinations, une seule obsession: que le client sente que tout est sous controle.</h2>
          <h2 aria-hidden="true">150+ destinations, une seule obsession: que le client sente que tout est sous controle.</h2>
        </div>
        <Globe2 />
      </section>
      <Footer />
    </main>
  );
}
