import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectById, projects } from "@/lib/project-data";
import {
  ProjectDetailView,
  type SerializableProject,
} from "@/components/project-detail";
import { projectExperiences } from "@/components/projects/experiences";
import { JsonLd } from "@/components/json-ld";
import {
  jsonLdGraph,
  personSchema,
  breadcrumbSchema,
  SITE_URL,
} from "@/lib/seo";

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
    keywords: project.technologies,
    alternates: {
      canonical: `/projects/${project.id}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/projects/${project.id}`,
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
  const serializableProject = serializable as SerializableProject;

  // Render a bespoke experience if this project has one; otherwise fall back
  // to the generic detail view.
  const Experience = projectExperiences[project.id];

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          {
            "@type": "CreativeWork",
            "@id": `${SITE_URL}/projects/${project.id}#work`,
            name: project.title,
            description: project.description[0],
            url: `${SITE_URL}/projects/${project.id}`,
            image: `${SITE_URL}${project.image}`,
            genre: project.category,
            keywords: project.technologies.join(", "),
            author: { "@id": `${SITE_URL}/#person` },
            ...(project.link ? { sameAs: project.link } : {}),
          },
          personSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Projects", path: "/#work" },
            { name: project.title, path: `/projects/${project.id}` },
          ])
        )}
      />
      {Experience ? (
        <Experience project={serializableProject} />
      ) : (
        <ProjectDetailView project={serializableProject} />
      )}
    </>
  );
}
