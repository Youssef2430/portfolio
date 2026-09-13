"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowDown, ArrowUpRight, Camera, Scissors, Sparkles, LockKeyhole, Heart, Coffee } from "lucide-react";
import { MotionConfig } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { SerializableProject } from "@/components/project-detail";
import { MugshotTechStack } from "@/components/projects/mugshot-tech-stack";
import { MugshotJournal } from "@/components/projects/mugshot-journal";
import { StudyNav, NextStudy } from "@/components/projects/case-study-chrome";

const CHAPTERS = [{ id: "ritual", label: "The ritual" }, { id: "collection", label: "The app" }, { id: "daily", label: "Daily details" }, { id: "craft", label: "The craft" }];
function Phone({ screen, alt, priority = false }: { screen: string; alt: string; priority?: boolean }) {
  return <div className="mug-device"><div>
    <Image src={`/mugshot/${screen}-light.PNG`} alt={alt} fill priority={priority} sizes="(max-width: 768px) 65vw, 300px" className="object-cover object-top dark:hidden" />
    <Image src={`/mugshot/${screen}-dark.PNG`} alt="" aria-hidden fill priority={priority} sizes="(max-width: 768px) 65vw, 300px" className="hidden object-cover object-top dark:block" />
  </div></div>;
}
function Cutout({ name, className = "" }: { name: string; className?: string }) {
  return <Image src={`/mugshot/stickers/${name}.png`} alt="" aria-hidden width={180} height={240} className={`mug-cutout ${className}`} draggable={false} />;
}
const SCREENS = [
  { name: "The calendar", screen: "home", title: "A month made of little moments.", description: "Every cup gets its own place. A familiar calendar becomes a collection of the drinks, days, and tiny rituals you want to remember.", detail: "Your photos. Your stickers. Your story." },
  { name: "The day", screen: "day", title: "Some days deserve a closer look.", description: "Open a day, arrange its stickers, and find every drink on a little receipt. The kind of history you actually want to look back at.", detail: "Drag to arrange · Every cup accounted for" },
  { name: "The recap", screen: "wrapped", title: "Meet your coffee personality.", description: "A month of small rituals turns into a Wrapped recap, with your favorite drink, a coffee persona, and a card worth sharing.", detail: "From Iced Latte Loyalist to The Explorer" },
];
function AppCollection() {
  const [selected, setSelected] = useState(0);
  const screen = SCREENS[selected];
  return <div className="mug-collection">
    <div className="mug-collection-visual">
      <span className="mug-collection-number" aria-hidden="true">0{selected + 1}</span>
      <div className="mug-collection-phone"><Phone screen={screen.screen} alt={`Mugshot: ${screen.name}`} /></div>
      <Cutout name={selected === 2 ? "mocha" : "matcha"} className="mug-collection-sticker" />
    </div>
    <div className="mug-collection-copy">
      <span className="study-eyebrow">02 / A journal, with personality</span>
      <div className="mug-screen-tabs" role="tablist" aria-label="Explore Mugshot screens">{SCREENS.map((item, i) => <button type="button" key={item.name} id={`mug-tab-${i}`} role="tab" aria-selected={selected === i} aria-controls="mug-screen-panel" tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={event => {
        const next = event.key === "ArrowRight" ? (i + 1) % 3 : event.key === "ArrowLeft" ? (i + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : null;
        if (next === null) return;
        event.preventDefault();setSelected(next);document.getElementById(`mug-tab-${next}`)?.focus();
      }}>{item.name}</button>)}</div>
      <div id="mug-screen-panel" role="tabpanel" aria-labelledby={`mug-tab-${selected}`} tabIndex={0}>
        <h2 className="mug-display">{screen.title}</h2><p>{screen.description}</p><span className="mug-collection-detail"><Heart size={14} />{screen.detail}</span>
      </div>
    </div>
  </div>;
}

export function MugshotExperience({ project }: { project: SerializableProject }) {
  return <MotionConfig reducedMotion="user"><main id="project-top" className="mugshot-theme study-page mug-editorial min-h-screen overflow-clip bg-background text-foreground">
    <Navbar />
    <section className="mug-hero">
      <div className="study-width">
        <Link href="/#work" className="study-back"><ArrowLeft size={14} />Back to work</Link>
        <div className="mug-hero-grid">
          <div className="mug-hero-copy">
            <div className="mug-wordmark"><Image src="/mugshot/icon.png" alt="" width={44} height={44} /><span>Mugshot</span><span className="mug-edition">A little daily ritual</span></div>
            <h1 className="mug-display">Your daily cup.<br />Worth <em>keeping.</em></h1>
            <p>A coffee journal with a soft spot for the little things. Turn your cup into a sticker, collect your days, and make a memory out of your morning.</p>
            <div className="study-actions"><a href="#ritual" className="mug-primary">Make a little memory<ArrowUpRight size={17} /></a><a href="#collection" className="study-text-link">Meet the app<ArrowDown size={15} /></a></div>
            <div className="mug-hero-facts"><span>Made for iPhone</span><span>All on device</span><span>No account needed</span></div>
          </div>
          <div className="mug-hero-scene">
            <div className="mug-hero-disc" aria-hidden="true" />
            <div className="mug-hero-label"><Scissors size={13} />A cup. A cutout. A keepsake.</div>
            <div className="mug-hero-phone"><Phone screen="home" alt="Mugshot’s monthly calendar filled with coffee stickers" priority /></div>
            <div className="mug-mini-receipt"><Coffee size={21} /><span>THE MORNING EDIT</span><strong>One good cup.<br />One good day.</strong><div><span>Memories</span><span>Priceless</span></div><i aria-hidden="true" /></div>
            <Cutout name="matcha" className="mug-hero-matcha" /><Cutout name="dalgona" className="mug-hero-latte" /><Cutout name="espresso-top" className="mug-hero-espresso" />
            <span className="mug-hero-note">Made to be collected.</span>
          </div>
        </div>
      </div>
      <div className="mug-ribbon"><span>Snap your cup</span><Sparkles size={15} /><span>Keep the sticker</span><Sparkles size={15} /><span>Collect the little things</span><Sparkles size={15} /><span>Repeat tomorrow</span></div>
    </section>
    <StudyNav name="Mugshot" chapters={CHAPTERS} />

    <section id="ritual" className="study-section"><div className="study-width"><MugshotJournal /></div></section>
    <section id="collection" className="study-section mug-collection-section"><div className="study-width"><AppCollection /></div></section>

    <section id="daily" className="study-section"><div className="study-width">
      <div className="mug-section-intro"><span className="study-eyebrow">03 / The thoughtful little details</span><h2 className="mug-display">A little more than<br /><em>a pretty sticker.</em></h2><p>A gentle caffeine meter. Widgets that fit your day. A month of memories, ready to share.</p></div>
      <div className="mug-daily-grid">
        <article className="mug-widget-feature"><span className="study-eyebrow">A glance is enough</span><h3 className="mug-display">Your day, on display.</h3><div className="mug-widget-pair"><Image src="/mugshot/widgets/today-caffeine.png" alt="Mugshot widget with daily caffeine, cups, and streak" width={1062} height={500} sizes="(max-width:768px) 80vw, 520px" /><Image src="/mugshot/widgets/active-caffeine.png" alt="Active caffeine widget" width={505} height={503} sizes="(max-width:768px) 35vw, 180px" /></div><p>Home-screen widgets keep today’s total and estimated active caffeine close. No need to open the app.</p></article>
        <article className="mug-meter-feature"><span className="study-eyebrow">An example day</span><div className="mug-meter-dial"><div><strong>247<small>mg</small></strong><span>Caffeine logged</span></div></div><h3 className="mug-display">Know your rhythm.</h3><p>Editable drink estimates and a personal daily target. The active-caffeine view uses a five-hour half-life model.</p><span className="mug-meter-note">Illustration: 247 mg of a 400 mg target</span></article>
      </div>
      <div className="mug-recap-feature"><div className="mug-recap-art"><Image src="/mugshot/recaps/daily-card.png" alt="Daily coffee recap export" width={656} height={1057} sizes="(max-width:768px) 43vw, 240px" /><Image src="/mugshot/recaps/monthly-card.png" alt="Monthly coffee Wrapped export" width={656} height={1057} sizes="(max-width:768px) 43vw, 240px" /></div><div><span className="study-eyebrow">Camera roll, meet coffee roll</span><h2 className="mug-display">A month of you.<br /><em>With extra foam.</em></h2><p>Your favorites, your habits, your coffee persona. Daily and monthly recap cards turn a private ritual into something you can share.</p><div className="mug-personas"><span>Iced Latte Loyalist</span><span>The Explorer</span><span>Steady Sipper</span></div></div></div>
    </div></section>

    <section id="craft" className="study-section mug-craft"><div className="study-width">
      <div className="mug-section-intro"><span className="study-eyebrow">04 / Small app. Thoughtful engineering.</span><h2 className="mug-display">A little magic.<br /><em>All on your phone.</em></h2><p>Built solo in SwiftUI. Capture, cutout, drink analysis, and storage stay on device.</p></div>
      <div className="mug-craft-steps">{[
        { Icon: Camera, title: "Capture the cup", text: "Start with the camera or a photo you already love." },
        { Icon: Scissors, title: "Lift the sticker", text: "Vision isolates the drink, with flood-fill and crop fallbacks." },
        { Icon: Sparkles, title: "Read the drink", text: "An on-device model estimates drink type, serving size, and caffeine." },
        { Icon: LockKeyhole, title: "Keep it yours", text: "Save locally, refresh widgets, and optionally sync caffeine to Apple Health." },
      ].map(({ Icon, title, text }, i) => <article key={title}><div><Icon size={23} strokeWidth={1.6} /><span>0{i + 1}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      <div className="mug-craft-details"><details><summary>The pipeline behind the sticker</summary><p>Foreground extraction and drink analysis run concurrently. Vision’s foreground lift is preferred; classical flood-fill and a rounded-crop fallback keep capture resilient. The drink and its image are stored locally as JSON and image files, with an atomic backup manifest.</p></details><details><summary>Small controls that make a difference</summary><p>Appearance, a personal caffeine target, weekly logging goals, optional reminders, and Apple Health sync live in Settings. WidgetKit snapshots refresh after saves and use the same caffeine model as the app.</p></details></div>
      <MugshotTechStack />
      <div className="mug-build-note"><span>Designed & built by Youssef Chouay / {project.timeline}</span><div><a href="/mugshot/privacy.html">Privacy<ArrowUpRight size={12} /></a><a href="/mugshot/support.html">Support<ArrowUpRight size={12} /></a></div></div>
    </div></section>
    <NextStudy current="mugshot" /><Footer />
  </main></MotionConfig>;
}
