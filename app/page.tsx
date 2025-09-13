import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Experience } from "@/components/experience";
import { Projects } from "@/components/projects";
import { About } from "@/components/about";
import { Footer } from "@/components/footer";
import { Education } from "@/components/education";
import { Skills } from "@/components/skills";
import { AskInput } from "@/components/ask-input";
import { BlogSection } from "@/components/blog-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Hero />
        <Education />
        <Experience />
        <Projects />
        <BlogSection />
        <Skills />
        <About />
      </div>
      <AskInput />
      <Footer />
    </main>
  );
}
