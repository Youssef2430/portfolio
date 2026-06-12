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

export default function Home() {
  return (
    <PageTransition>
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
