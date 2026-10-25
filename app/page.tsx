import { HealthStatus } from "@/components/HealthStatus";
import { ProductList } from "@/components/ProductList";
import Link from "next/link";

const layers = [
  {
    name: "Code scan",
    text: "Reads the QR code or barcode with the phone camera and validates it.",
    milestone: "Milestone 2",
  },
  {
    name: "Image check",
    text: "A neural network inspects a photo of the packaging for signs of a fake.",
    milestone: "Milestones 4–5",
  },
  {
    name: "Database lookup",
    text: "Matches the product against genuine records, known fakes and recalls.",
    milestone: "Milestone 3",
  },
];

const milestones = [
  "Project scaffold & data model",
  "Scanning module (code layer)",
  "Authenticity database & lookup",
  "Image dataset & CNN training",
  "Image-recognition service",
  "Fusion engine & verdict",
  "User interface & reporting",
  "Evaluation & hardening",
];
const CURRENT = 8;

/**
 * Placeholder home page for Milestone 1.
 * Shows that the front end, the API and MongoDB are wired together.
 * The scan flow replaces the hero button in Milestone 7.
 */
export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">VeriSip · prototype</p>
        <h1>Check before you sip.</h1>
        <p className="lead">
          VeriSip flags counterfeit and adulterated beverages by combining three independent checks
          into one explained trust score.
        </p>
        <Link href="/scan" className="btn" style={{ textDecoration: "none", display: "inline-block" }}>
          Scan a product
        </Link>
      </header>

      <section className="layers" aria-label="Detection layers">
        {layers.map((l) => (
          <article key={l.name} className="layer">
            <span className="tag">{l.milestone}</span>
            <h3>{l.name}</h3>
            <p>{l.text}</p>
          </article>
        ))}
      </section>

      <p className="formula mono">
        trust = w<sub>code</sub>·code + w<sub>image</sub>·image + w<sub>db</sub>·database →{" "}
        <span className="badge badge-authentic">≥ 0.80 Authentic</span>{" "}
        <span className="badge badge-recalled">≥ 0.50 Suspicious</span>{" "}
        <span className="badge badge-counterfeit">Likely Counterfeit</span>
      </p>

      <div className="grid">
        <HealthStatus />
        <section className="card">
          <div className="card-head">
            <h2>Build progress</h2>
            <span className="muted">
              {CURRENT} / {milestones.length}
            </span>
          </div>
          <ol className="milestones">
            {milestones.map((m, i) => (
              <li key={m} className={i < CURRENT ? "done" : i === CURRENT ? "next" : ""}>
                <span className="num">{i + 1}</span>
                {m}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <ProductList />

      <footer className="footer">
        America, Godstime · U2021/5520027 · Department of Computer Science, University of Port Harcourt
      </footer>
    </main>
  );
}
