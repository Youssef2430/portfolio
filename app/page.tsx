import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Education } from "@/components/education";
import { Experience } from "@/components/experience";
import { Projects } from "@/components/projects";
import { BlogSection } from "@/components/blog-section";
import { CurrentListen } from "@/components/current-listen";
import { Footer } from "@/components/footer";
import { AskInput } from "@/components/ask-input";
import { PageTransition } from "@/components/page-transition";
import { JsonLd } from "@/components/json-ld";
import { jsonLdGraph, personSchema, websiteSchema, SITE_URL } from "@/lib/seo";

export default function Home() {
  return (
    <PageTransition>
      <JsonLd
        data={jsonLdGraph(personSchema, websiteSchema, {
          "@type": "ProfilePage",
          "@id": `${SITE_URL}/#profilepage`,
          url: SITE_URL,
          mainEntity: { "@id": `${SITE_URL}/#person` },
          isPartOf: { "@id": `${SITE_URL}/#website` },
        })}
      />
      <main className="relative z-10 min-h-screen bg-background">
        {/* Grain overlay */}
        <div className="grain-overlay" />

        {/* Navigation */}
        <Navbar />

        {/* Sections */}
        <div id="home">
          <Hero />
        </div>

        <About />

        <Education />

        <Experience />

        <Projects />

        <BlogSection />

        <CurrentListen />

        <Footer />

        {/* Floating chat input */}
        <AskInput />
      </main>
    </PageTransition>
  );
}
