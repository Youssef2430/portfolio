"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { SerializableProject } from "@/components/project-detail";
import { Facts, Hero, ProjectPage, Section } from "@/components/projects/case-study-chrome";

export function MugshotExperience({ project }: { project: SerializableProject }) {
  return <ProjectPage id="mugshot" theme="mugshot-theme mug-minimal">
    <Hero
      mark={<Image src="/mugshot/icon.png" alt="" width={30} height={30} />}
      name="Mugshot"
      title="A calendar of every coffee you drink."
      lede="Take a photo of your cup and Mugshot cuts it out like a sticker and puts it on today. Add a note, look back over the month, and keep an eye on your caffeine."
      actions={<a href={project.link} target="_blank" rel="noopener noreferrer" className="pp-button">Visit the website<ArrowUpRight size={16} /></a>}
      meta="iPhone and iPad · Works on device"
      visual={<figure className="mug-hero-art">
        <div className="mug-phone">
          <Image src="/mugshot/calendar-light.webp" alt="Mugshot’s October calendar with saved coffee photos and a daily caffeine total" width={720} height={1565} priority sizes="260px" className="dark:hidden" />
          <Image src="/mugshot/calendar-dark.webp" alt="Mugshot’s coffee calendar in dark appearance" width={720} height={1565} priority sizes="260px" className="hidden dark:block" />
        </div>
        <figcaption>A sample journal</figcaption>
      </figure>}
    />

    <Facts items={[
      ["Platform", "iPhone and iPad"],
      ["Released", project.timeline ?? "2026"],
      ["Built with", project.technologies.join(", ")],
    ]} />

    <Section id="ritual" title="How it works">
      <ol className="pp-steps">
        <li><strong>Snap your cup.</strong>The photo becomes a cutout, ready for the calendar.</li>
        <li><strong>Keep the day.</strong>Add a note, revisit any day, and share a monthly recap.</li>
        <li><strong>Notice the pattern.</strong>Coffee counts, caffeine estimates, and widgets for your home screen.</li>
      </ol>
    </Section>

    <Section id="craft" title="How it’s built">
      <p>SwiftUI, with the cutouts made on device by Vision and everything stored locally. WidgetKit keeps your day on the home screen, and optional HealthKit sync saves caffeine to Apple Health.</p>
    </Section>
  </ProjectPage>;
}
