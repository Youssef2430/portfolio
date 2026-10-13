"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { SerializableProject } from "@/components/project-detail";
import { Facts, Hero, ProjectPage, Rows, Section, TabList } from "@/components/projects/case-study-chrome";

const VIEWS = [
  { id: "today", label: "On view today", src: "home-light", darkSrc: "home-dark", title: "One painting a day, free.", text: "A different artwork every day, to enjoy full screen.", alt: "Gallery Glow’s Apple TV home screen featuring The Birth of Venus as the free daily artwork" },
  { id: "collection", label: "The collection", src: "collection", title: "A collection to come back to.", text: "Browse the paintings, return to a favorite, and give each one the whole screen.", alt: "Gallery Glow’s collection of framed paintings on Apple TV" },
  { id: "ambient", label: "Ambient scenes", src: "ambient-pink-orange", title: "Color for a quiet room.", text: "Five slow, animated gradients for when you want light rather than a picture.", alt: "Gallery Glow’s Pink Orange ambient scene filling the screen with warm sunset colors" },
];

export function GalleryGlowExperience({ project }: { project: SerializableProject }) {
  const [selected, setSelected] = useState(0);
  const view = VIEWS[selected];
  return <ProjectPage id="gallery-glow" theme="gallery-theme">
    <Hero
      mark={<Image src="/gallery-glow/icon.png" alt="" width={30} height={30} />}
      name="Gallery Glow"
      title="Classic paintings for the living room."
      lede="Gallery Glow turns an Apple TV into a small, quiet gallery: a free painting every day, a collection of classics, and five slow ambient scenes."
      actions={<>
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="pp-button">Visit the website<ArrowUpRight size={16} /></a>
        <a href="https://github.com/yssf-c/Gallery-Glow" target="_blank" rel="noopener noreferrer" className="pp-link">Source on GitHub<ArrowUpRight size={14} /></a>
      </>}
      meta="9 artists · 5 ambient scenes · tvOS"
      visual={<figure className="gallery-hero-art">
        <div className="gallery-frame"><Image src="/gallery-glow/venus.webp" alt="The Birth of Venus by Sandro Botticelli" width={1600} height={1004} priority sizes="(max-width: 860px) 90vw, 640px" /></div>
        <figcaption><em>The Birth of Venus</em> · Sandro Botticelli, 1485</figcaption>
      </figure>}
    />

    <Facts items={[
      ["Platform", "Apple TV"],
      ["Year", project.timeline ?? "2026"],
      ["Built with", project.technologies.join(", ")],
    ]} />

    <Section id="collection" title="Inside the app" wide={<>
      <TabList label="Gallery Glow views" prefix="gallery" items={VIEWS} selected={selected} onSelect={setSelected} />
      <div id="gallery-panel" role="tabpanel" aria-labelledby={`gallery-tab-${view.id}`} tabIndex={0}>
        <div className="gallery-tv">
          <Image key={view.src} src={`/gallery-glow/${view.src}.webp`} alt={view.alt} width={1600} height={900} sizes="(max-width: 860px) 90vw, 1120px" className={view.darkSrc ? "dark:hidden" : undefined} />
          {view.darkSrc && <Image key={view.darkSrc} src={`/gallery-glow/${view.darkSrc}.webp`} alt={`${view.alt}, dark appearance`} width={1600} height={900} sizes="(max-width: 860px) 90vw, 1120px" className="hidden dark:block" />}
        </div>
        <p className="pp-caption"><strong>{view.title}</strong> {view.text}</p>
      </div>
    </>}>
      <p>The interface stays small so each painting can have the whole screen.</p>
    </Section>

    <Section id="craft" title="Behind the frame">
      <Rows items={[
        ["Made for the remote", "SwiftUI focus states, generous spacing, and light and dark appearances keep browsing easy from the sofa."],
        ["On the home screen", "A Top Shelf extension brings the collection to the Apple TV home screen, with artwork and artist credits."],
        ["One purchase", "The daily painting is free. A one-time StoreKit unlock opens every painting and ambient scene."],
      ]} />
    </Section>
  </ProjectPage>;
}
