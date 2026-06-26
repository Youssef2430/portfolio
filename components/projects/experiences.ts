import type { ComponentType } from "react";
import type { SerializableProject } from "@/components/project-detail";
import { AtlasLLMExperience } from "@/components/projects/atlasllm-experience";
import { CluiExperience } from "@/components/projects/clui-experience";

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
  atlasllm: AtlasLLMExperience,
  clui: CluiExperience,
};
