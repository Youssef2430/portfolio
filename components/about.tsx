"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Github, Globe, Linkedin, Mail } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { ParallaxSection } from "./parallax-section";
import { LinkPreview } from "./ui/link-preview";

export function About() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/Youssef2430",
      label: "GitHub",
      previewImage: "/placeholder.svg?height=400&width=640&text=GitHub+Profile",
    },
    {
      icon: Linkedin,
      href: "https://linkedin.com/in/youssef-chouay",
      label: "LinkedIn",
      previewImage:
        "/placeholder.svg?height=400&width=640&text=LinkedIn+Profile",
    },
    {
      icon: Mail,
      href: "mailto:ychou031@uottawa.ca",
      label: "Email",
      previewImage: "/placeholder.svg?height=400&width=640&text=Email",
    },
  ];

  return (
    <section id="about" className="py-24 sm:py-32">
      <ParallaxSection offset={15}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading japanese="私について" english="About Me" />

          <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              className="md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-lg leading-relaxed mb-6 text-gray-800 dark:text-gray-200">
                I'm a software engineer and researcher with a passion for
                creating elegant, efficient solutions to complex problems.
                <sup>
                  <span className="text-xs font-normal">
                    {" "}
                    (This is not contractual promise, I will do my best
                    though!!)
                  </span>
                </sup>
              </p>
              <p className="text-lg leading-relaxed mb-6 text-gray-800 dark:text-gray-200">
                Growing up curious about the world and my surroundings, I've
                always wanted to understand how they worked. I've kept that
                approach and mindset throughout my whole life and I'm slowly
                chipping the iceberg of knowledge hoping to make a big enough
                dent to make my younger self proud.
              </p>
              <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                Currently pursuing a Master's in Computer Science with a focus
                on Graph Theory, and working as an AI researcher for the
                Canadian National Research Council. I'm constantly exploring new
                technologies and ways to contribute.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-medium mb-4">Connect</h3>
              <ul className="space-y-4">
                {socialLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <li key={index}>
                      <LinkPreview url={link.href}>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                          <Icon className="h-5 w-5 mr-3" />
                          <span>{link.label}</span>
                        </div>
                      </LinkPreview>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        </div>
      </ParallaxSection>
    </section>
  );
}
