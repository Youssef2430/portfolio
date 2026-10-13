"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, MotionConfig } from "framer-motion";
import type { SerializableProject } from "@/components/project-detail";
import { Facts, Hero, ProjectPage, Rows, Section } from "@/components/projects/case-study-chrome";

const REPO_URL = "https://github.com/capstone-2024-T91/Image-Processing-and-NLP-for-Brand-Protection";
const EXTENSION_REPO_URL = "https://github.com/capstone-2024-T91/Frontend-Backend";

const SAMPLES = [
  {
    id: "safe",
    label: "Known sender",
    verdict: "Safe",
    sender: "no-reply@robinhood.com",
    subject: "Important information about your application",
    body: "Hi Tawfiq, thank you for taking the time to apply. We wanted to let you know that we are no longer accepting applications for the New Grad, Toronto position.",
    phishing: 1.6,
    signals: ["verified sender", "no credential request", "no payment pressure"],
  },
  {
    id: "phishing",
    label: "Urgent impersonation",
    verdict: "Phishing",
    sender: "security-payments@rnicrosoft-login.co",
    subject: "Account access suspended",
    body: "Your account has been restricted. Confirm your identity within 30 minutes at http://rnicrosoft-login.co/verify or your mailbox will be deleted.",
    phishing: 96.8,
    signals: ["lookalike domain", "deadline pressure", "credential link"],
  },
];

const PIPELINE = ["Open Gmail message", "Content script", "HTTPS request", "Flask API", "Clean the text", "Pick a model", "Badge in Gmail"];

function Shot({ base, alt, priority = false }: { base: string; alt: string; priority?: boolean }) {
  return <div className="phish-shot">
    <Image src={`${base}-light.png`} alt={alt} fill priority={priority} sizes="(max-width: 860px) 90vw, 560px" className="dark:hidden" />
    <Image src={`${base}-dark.png`} alt="" aria-hidden fill priority={priority} sizes="(max-width: 860px) 90vw, 560px" className="hidden dark:block" />
  </div>;
}

export function NLPPhishingExperience({ project }: { project: SerializableProject }) {
  return <MotionConfig reducedMotion="user"><ProjectPage id="nlp-phishing-detection" theme="phish-theme">
    <Hero
      layout="stacked"
      name="Phishing Detection"
      title="Flagging phishing emails inside Gmail."
      lede="Our capstone project: a Chrome extension that reads the email you have open, sends it to a fine-tuned classifier, and puts a Safe or Caution badge right beside the message."
      actions={<>
        <a href="#scanner" className="pp-button">Try a message<ArrowDown size={16} /></a>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="pp-link">Detector source<ArrowUpRight size={14} /></a>
        <a href={EXTENSION_REPO_URL} target="_blank" rel="noopener noreferrer" className="pp-link">Extension source<ArrowUpRight size={14} /></a>
      </>}
      visual={<div className="phish-shots">
        <figure><Shot base="/NLP-phishing/capstone" alt="Legitimate Gmail message marked Safe by the phishing detector" priority /><figcaption><i data-tone="safe" />A legitimate message, marked safe</figcaption></figure>
        <figure><Shot base="/NLP-phishing/capstone-phishing" alt="Suspicious Gmail message marked Unsafe and Dangerous by the phishing detector" priority /><figcaption><i data-tone="danger" />A phishing attempt, marked unsafe</figcaption></figure>
      </div>}
    />

    <Facts items={[
      ["Team", "Group 30, capstone"],
      ["When", project.timeline ?? "2024"],
      ["Data", "3.75M processed rows from four datasets"],
      ["Built with", project.technologies.join(", ")],
    ]} />

    <Section id="overview" title="In the inbox">
      <p>The detector is a model bench and a production service in one repository: DistilBERT and RoBERTa fine-tunes, OpenAI and Claude adapters, an Ollama route, evaluation tracked in Weights & Biases, and a Flask API that loads every model before it serves a request.</p>
      <p>The Chrome extension watches for the Gmail message you open, pulls out the body, sends it to the deployed detector, and shows the answer next to the message toolbar.</p>
    </Section>

    <Section id="scanner" title="Try a message" wide={<Scanner />}>
      <p>Every path first simplifies the message: links and punctuation come out and the case is normalized. The result goes to a classifier or model adapter that must answer phishing or safe.</p>
    </Section>

    <Section id="pipeline" title="The system" wide={
      <ol className="phish-pipeline">{PIPELINE.map(step => <li key={step}>{step}</li>)}</ol>
    }>
      <p>The architecture is deliberately direct, from the browser to the model and back. The finished system ran in Docker on a Hetzner VPS, behind Nginx with a Let’s Encrypt certificate, so the extension could call it from an ordinary browser session.</p>
    </Section>

    <Section id="models" title="The models">
      <Rows items={[
        ["DistilBERT", "The default classifier, loaded from the fine-tuned model folder."],
        ["RoBERTa", "A second transformer for sequence classification and comparison."],
        ["OpenAI", "A fine-tuned model behind the same phishing or safe contract."],
        ["Claude", "A prompted classifier for evaluation and fallback testing."],
        ["Ollama", "A local route that runs llama3 or another installed model."],
      ]} />
    </Section>
  </ProjectPage></MotionConfig>;
}

function Scanner() {
  const [index, setIndex] = useState(0);
  const sample = SAMPLES[index];
  const danger = sample.verdict === "Phishing";
  const cleaned = sample.body.replace(/http\S+/g, "").replace(/[^A-Za-z0-9\s]+/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  return <div className="phish-scanner">
    <div className="phish-scanner-pick" role="group" aria-label="Choose an example message">
      {SAMPLES.map((item, i) => <button key={item.id} type="button" aria-pressed={i === index} onClick={() => setIndex(i)}>{item.label}</button>)}
    </div>
    <div className="phish-scanner-grid">
      <article className="phish-mail">
        <p className="phish-mail-from">{sample.sender}</p>
        <p className="phish-mail-subject">{sample.subject}</p>
        <p>{sample.body}</p>
        <p className="phish-mail-clean"><span>Cleaned</span>{cleaned}</p>
      </article>
      <div className="phish-verdict" data-tone={danger ? "danger" : "safe"} aria-live="polite" aria-atomic="true">
        <p className="phish-verdict-word">{sample.verdict}</p>
        <p className="phish-verdict-score">{(danger ? sample.phishing : 100 - sample.phishing).toFixed(1)}% confidence</p>
        <div className="phish-meter" aria-hidden="true"><motion.span initial={false} animate={{ width: `${sample.phishing}%` }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }} /></div>
        <p className="phish-meter-legend"><span>Safe</span><span>Phishing</span></p>
        <ul>{sample.signals.map(signal => <li key={signal}>{signal}</li>)}</ul>
      </div>
    </div>
    <p className="pp-note">Illustrative examples. Nothing you see here is sent anywhere.</p>
  </div>;
}
