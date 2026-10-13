"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { SerializableProject } from "@/components/project-detail";
import { Facts, Hero, ProjectPage, Rows, Section, TabList } from "@/components/projects/case-study-chrome";

const SCREENS = [
  { id: "heart", label: "Heart rate", title: "Heart rate in context.", text: "Live heart rate, time in zone, and the session’s range at a glance.", alt: "BikeTrack’s live heart rate: a demo reading of 139 bpm in Zone 3", value: "139", unit: "bpm", tone: "coral" },
  { id: "power", label: "Power", title: "Power from your equipment.", text: "Watts from compatible Bluetooth equipment, in zones based on your FTP.", alt: "BikeTrack’s live power screen with a demo reading of 126 watts in Zone 1", value: "126", unit: "watts", tone: "lime" },
  { id: "summary", label: "Summary", title: "A summary when you stop.", text: "Review the workout, then save it to Apple Health and Fitness.", alt: "BikeTrack’s demo workout summary showing average heart rate and a workout chart", value: "145", unit: "avg bpm", tone: "coral" },
  { id: "zones", label: "Zones", title: "Zones you set yourself.", text: "Edit heart-rate and power boundaries right on the Watch.", alt: "BikeTrack’s zone editor with an aerobic boundary of 133 bpm", value: "133", unit: "bpm, zone 3", tone: "lime" },
];

export function WatchFrame({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return <div className="bike-watch"><div className="bike-watch-screen"><Image src={src} alt={alt} width={416} height={496} priority={priority} sizes="(max-width: 640px) 230px, 280px" /></div><span className="bike-watch-crown" aria-hidden="true" /></div>;
}

export function BikeTrackExperience({ project }: { project: SerializableProject }) {
  const [selected, setSelected] = useState(0);
  const screen = SCREENS[selected];
  return <ProjectPage id="biketrack" theme="bike-theme">
    <Hero
      mark={<Image src="/biketrack/icon.svg" alt="" width={30} height={30} />}
      name="BikeTrack"
      title="Heart rate and power, on your wrist."
      lede="A free Apple Watch app for indoor cycling, running and walking. It reads power from compatible Bluetooth equipment and heart rate from the Watch, and shows both in zones you set."
      actions={<>
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="pp-button">Visit the website<ArrowUpRight size={16} /></a>
        <a href="https://github.com/yssf-c/BikeTrack" target="_blank" rel="noopener noreferrer" className="pp-link">Source on GitHub<ArrowUpRight size={14} /></a>
      </>}
      meta="Free and open source · watchOS 11+"
      visual={<div className="bike-hero-art"><WatchFrame src="/biketrack/heart.webp" alt={SCREENS[0].alt} priority /></div>}
    />

    <Facts items={[
      ["Platform", "Apple Watch"],
      ["Year", project.timeline ?? "2026"],
      ["Built with", project.technologies.join(", ")],
    ]} />

    <Section id="experience" title="On the watch" wide={
      <div className="bike-dashboard">
        <WatchFrame src={`/biketrack/${screen.id}.webp`} alt={screen.alt} />
        <div>
          <TabList label="BikeTrack screens" prefix="bike" items={SCREENS} selected={selected} onSelect={setSelected} />
          <div id="bike-panel" role="tabpanel" aria-labelledby={`bike-tab-${screen.id}`} tabIndex={0}>
            <p className="bike-readout" data-tone={screen.tone} aria-hidden="true" key={screen.id}>{screen.value}<span>{screen.unit}</span></p>
            <h3>{screen.title}</h3>
            <p>{screen.text}</p>
          </div>
          <p className="pp-note">Screens show a simulated workout.</p>
        </div>
      </div>
    } />

    <Section id="engineering" title="How it’s built">
      <Rows items={[
        ["Equipment", "Core Bluetooth connects compatible FTMS bikes and treadmills, Cycling Power, and Speed & Cadence sensors."],
        ["Analytics", "A separate RideCore Swift package parses the packets and computes the workout analytics, so the SwiftUI app stays small."],
        ["Health", "HealthKit saves each session to Apple Health and Fitness. No account, no subscription, and no analytics in the app."],
      ]} />
      <p className="pp-note">Available readings depend on the connected equipment.</p>
    </Section>
  </ProjectPage>;
}
