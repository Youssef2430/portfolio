import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectById, projects } from "@/lib/project-data";
import {
  ProjectDetailView,
  type SerializableProject,
} from "@/components/project-detail";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) {
    return {
      title: "Project not found | Youssef Chouay",
      description: "The requested project could not be found.",
    };
  }

  const title = `${project.title} | Youssef Chouay`;
  const description = project.description[0] ?? project.category;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: project.image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.image],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  // Strip the non-serializable icon before crossing into the client component
  const { icon: _icon, ...serializable } = project;

  return <ProjectDetailView project={serializable as SerializableProject} />;
}
