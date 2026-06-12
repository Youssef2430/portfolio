export const SITE_URL = "https://youssefchouay.com";
export const SITE_NAME = "Youssef Chouay";
export const SITE_DESCRIPTION =
  "Portfolio of Youssef Chouay — Software Engineer and AI Researcher based in Ottawa, Canada.";

export const SOCIAL_LINKS = [
  "https://github.com/Youssef2430",
  "https://linkedin.com/in/youssef-chouay",
];

/**
 * schema.org Person — reused across pages so search engines build a
 * consistent knowledge-graph entity for the site owner.
 */
export const personSchema = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Youssef Chouay",
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  jobTitle: "Software Engineer & AI Researcher",
  worksFor: {
    "@type": "Organization",
    name: "National Research Council Canada",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Ottawa",
  },
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "Graph Theory",
    "Software Engineering",
    "Distributed Systems",
    "Building Automation Systems",
  ],
  sameAs: SOCIAL_LINKS,
};

export const websiteSchema = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#person` },
  inLanguage: "en",
};

export function breadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Wrap one or more schema.org nodes into a single JSON-LD graph. */
export function jsonLdGraph(...nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
