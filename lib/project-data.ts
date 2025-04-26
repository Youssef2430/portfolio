import type React from "react";
export type ProjectDetail = {
  id: string;
  title: string;
  category: string;
  description: string[];
  image: string;
  imageLink?: string;
  technologies: string[];
  timeline?: string;
  contributors?: string[];
  link?: string;
  size?: "small" | "large";
  icon?: React.ReactNode;
};

export const projects: ProjectDetail[] = [
  {
    id: "nlp-phishing-detection",
    title: "NLP Phishing Detection",
    category: "Bell Canada Research Project",
    description: [
      "Built a phishing detection system using NLP and computer vision (CNNs) for website classification and clustering, achieving 98.4% accuracy.",
      "Developed a Chrome extension to integrate phishing detection directly into email clients and implemented an automated pipeline with AWS S3 for retraining on new phishing data.",
    ],
    image: "/capstone-example.png?height=600&width=800",
    imageLink: "/capstone-activity.jpeg?height=600&width=800",
    technologies: [
      "Python",
      "TensorFlow",
      "NLP",
      "Computer Vision",
      "AWS S3",
      "Chrome Extension API",
    ],
    timeline: "Jan 2023 - Dec 2023",
    contributors: ["Youssef Chouay", "Bell Canada Research Team"],
    link: "https://github.com/capstone-2024-T91/Image-Processing-and-NLP-for-Brand-Protection",
    size: "large",
  },
  {
    id: "geegees-intramural",
    title: "GeeGee's Intramural website",
    category: "Personal Project",
    description: [
      "Built a GeeGees Intramural Sports Hub from scratch using Next.js + TypeScript/Tailwind UI, SSR pages for leagues/teams/schedules, and slick Chart.js visualizations—delivering an accessible, responsive experience for thousands of students.",
      "Designed a high-throughput Rust + Actix-web API backed by SQLx/PostgreSQL that streams real-time standings, Elo ratings, and predictive match analytics with sub 20ms latency.",
      "Drove concurrency with async/await and strict type-safety to create a modular, fault-tolerant codebase that scales gracefully under heavy traffic.",
    ],
    image: "/geegeeshub.png?height=600&width=800",
    imageLink: "/geegeeshub-roadmap.jpeg?height=600&width=800",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Rust",
      "Actix-web",
      "PostgreSQL",
      "Chart.js",
    ],
    timeline: "May 2023 - Present",
    contributors: ["Youssef Chouay"],
    link: "https://github.com/Youssef2430/geegeeshub",
    size: "small",
  },
  {
    id: "distributed-file-storage",
    title: "Distributed File Storage System",
    category: "Personal Project",
    description: [
      "Designed and developed a scalable, fault-tolerant distributed file storage system using Go, enabling efficient storage and retrieval across multiple nodes.",
      "Implemented consistent hashing and data replication to ensure high availability and reliability.",
      "Optimized network communication with gRPC and Protocol Buffers, reducing data transfer latency by 35%.",
    ],
    image: "/dfs.png?height=600&width=800",
    imageLink: "/dfs-github.png?height=600&width=800",
    technologies: [
      "Go",
      "gRPC",
      "Protocol Buffers",
      "Distributed Systems",
      "Consistent Hashing",
    ],
    timeline: "Sept 2022 - Dec 2022",
    contributors: ["Youssef Chouay"],
    link: "https://github.com/Youssef2430/distributed-file-storage",
    size: "small",
  },
];

export function getProjectById(id: string): ProjectDetail | undefined {
  return projects.find((project) => project.id === id);
}
