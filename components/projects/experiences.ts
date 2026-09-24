import type { ComponentType } from "react";
import type { SerializableProject } from "@/components/project-detail";
import { RamelliExperience } from "@/components/projects/atlasllm-experience";
import { GluiExperience } from "@/components/projects/glui-experience";
import { NLPPhishingExperience } from "@/components/projects/nlp-phishing-experience";
import { MugshotExperience } from "@/components/projects/mugshot-experience";

/**
 * Per-project bespoke "experience" pages.
 *
 * A project whose id appears here renders its hand-authored, scroll-driven
 * experience instead of the generic `ProjectDetailView`. Any project not
 * listed here falls back to the generic template automatically.
 */
export const projectExperiences: Record<
  string,
  ComponentType<{ project: SerializableProject }>
> = {
  ramelli: RamelliExperience,
  glui: GluiExperience,
  "nlp-phishing-detection": NLPPhishingExperience,
  mugshot: MugshotExperience,
};
