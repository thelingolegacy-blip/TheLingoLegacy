import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const systems = [
  { name: "Nexus Web", stack: "React · JavaScript · HTML", state: "Scaffolded", detail: "Independent frontend with a production build target." },
  { name: "Serverless Gateway", stack: "API Gateway · Python Lambda", state: "Template only", detail: "IAM-authorized job route; deploy after account and security review." },
  { name: "Queue & Jobs", stack: "SQS · DynamoDB", state: "Template only", detail: "Asynchronous intake and durable status records." },
  { name: "Evidence Storage", stack: "Private S3 · SHA-256", state: "Template only", detail: "Encrypted, non-public storage foundation for future evidence bundles." },
  { name: "Observability", stack: "CloudWatch · Grafana-ready", state: "Not connected", detail: "Log group and alarm resources are defined; dashboards need live metrics." },
  { name: "Delivery", stack: "Docker · Linux · GitHub Actions", state: "Scaffolded", detail: "Container and build validation are provided; no deployment credentials included." }
];

function App() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="LINGOsonic Nexus home"><span className="mark">N</span><span>LINGO<span className="muted">SONIC</span><small>NEXTUS V8 · NITRO CANON</small></span></a>
        <span className="status"><i /> ISOLATED SIDECAR</span>
      </header>
      <section className="hero" id="home">
        <p className="eyebrow">LINGO LEGACY · ENGINEERING NEXUS</p>
        <h1>A second route.<br /><em>Built to be verified.</em></h1>
        <p className="intro">An independent web and serverless foundation for tooling, job intake, evidence handling, and operational visibility—without changing the protected flagship environment.</p>
        <div className="hero-actions"><a className="button primary" href="#systems">Explore systems <span>↘</span></a><a className="button secondary" href="#guardrails">Read the guardrails</a></div>
        <div className="signal-row"><div><b>01</b><span>ISOLATED SOURCE</span></div><div><b>02</b><span>IAM-FIRST API</span></div><div><b>03</b><span>EVIDENCE BEFORE RELEASE</span></div></div>
      </section>
      <section className="systems" id="systems">
        <div className="section-heading"><div><p className="eyebrow">PLATFORM MAP</p><h2>Systems at a glance</h2></div><span className="pill">DEV BASELINE · NOT DEPLOYED</span></div>
        <div className="grid">{systems.map((item, index) => <article className="card" key={item.name}><div className="card-top"><span className="index">0{index + 1}</span><span className="state">{item.state}</span></div><h3>{item.name}</h3><p className="stack">{item.stack}</p><p className="detail">{item.detail}</p></article>)}</div>
      </section>
      <section className="architecture">
        <div><p className="eyebrow">REQUEST PATH</p><h2>Small surface.<br />Clear boundaries.</h2><p>Keep the browser public-facing and credential-free. Authenticate infrastructure operations through a trusted identity, then hand asynchronous work to a queue.</p></div>
        <div className="flow" aria-label="Architecture flow"><div>React frontend<span>Static build</span></div><b>↓</b><div>API Gateway<span>AWS IAM authorization</span></div><b>↓</b><div>Python Lambda<span>Validate · enqueue · record</span></div><b>↓</b><div className="flow-pair"><div>SQS + DLQ<span>Async work</span></div><div>DynamoDB<span>Job status</span></div></div><b>↓</b><div>S3 private artifacts<span>CloudWatch logs & alarms</span></div></div>
      </section>
      <section className="guardrails" id="guardrails"><p className="eyebrow">RELEASE RULES</p><h2>Separate the sidecar.<br /><em>Protect the source of truth.</em></h2><div className="rules"><p><span>✓</span> Separate branch and directory; no mainline merge.</p><p><span>✓</span> No secrets, tokens, or credentials in source control.</p><p><span>✓</span> No public artifact bucket or unauthenticated job route.</p><p><span>✓</span> No production DNS, Firebase, Cloudflare, or flagship mutations.</p><p><span>!</span> RDS, Kafka/MSK, ECS, and Amplify remain optional until cost and access are reviewed.</p></div></section>
      <footer><span>LINGOsonicNextusV8NitroCanon</span><span>LOYALTY. LEGACY. LANGUAGE.</span><span>Sidecar status: source scaffold only</span></footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
