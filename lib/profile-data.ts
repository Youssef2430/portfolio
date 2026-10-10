/**
 * Experience and education, as plain data.
 *
 * The home page renders these and the site guide (`/api/ask`) reads them, so
 * a fact only has to be written once. Bullets allow two bits of inline
 * markup: `**bold**` and `[label](url)`.
 */

export type YearMonth = [year: number, month: number];

export type Role = {
  id: string;
  role: string;
  company: string;
  short: string;
  url: string;
  location: string;
  period: string;
  start: YearMonth;
  end: YearMonth | null; // null = present
  summary: string;
  metric: { value: string; label: string };
  stack: string[];
  groups: { name?: string; bullets: string[] }[];
};

export const roles: Role[] = [
  {
    id: "trend",
    role: "Software Engineer Intern",
    company: "TrendMicro / TrendAI",
    short: "TrendAI",
    url: "https://www.trendmicro.com/",
    location: "Ottawa, ON",
    period: "Jan 2026 – Present",
    start: [2026, 0],
    end: null,
    summary: "LLM threat detection on the AI Security team.",
    metric: { value: "4×", label: "faster inference" },
    stack: ["Rust", "Go", "AWS", "MCP", "LLM security"],
    groups: [
      {
        bullets: [
          "Worked with the AI Security team to migrate a prompt-scan engine to state-of-the-art detection models for LLM threat analysis, including implementation, testing, debugging, and rollout support.",
          "Implemented chunking behavior for an inference engine in Rust and Go, improving support for long prompts and document-style inputs in AI security workflows.",
          "Introduced dynamic chunking to the inference engine, speeding up inference by 4× and cutting energy usage by 62% while raising throughput.",
          "Owned design, implementation, testing, and AWS deployment of a backend service that retrieves company profiles and market data through MCP-based integrations for cybersecurity research workflows.",
        ],
      },
    ],
  },
  {
    id: "nrc",
    role: "Artificial Intelligence Researcher",
    company: "National Research Council",
    short: "NRC",
    url: "https://nrc.canada.ca/en",
    location: "Ottawa, ON",
    period: "May 2024 – Present",
    start: [2024, 4],
    end: null,
    summary: "First-author research putting LLM agents inside buildings and utilities.",
    metric: { value: "56%", label: "lower maintenance costs" },
    stack: ["Python", "LangChain", "Multi-agent", "SQLite", "Time-series"],
    groups: [
      {
        name: "AI-Enhanced Building Automation (BAS)",
        bullets: [
          "Published, as **first author**, the peer-reviewed paper “**Implementing AI in Smart Buildings: A Modular, Proof-of-Concept approach**” and presented it at [IEEE EPEC 2025](https://epec2025.ieee.ca/).",
          "Designed and deployed Python/LangChain agents bridging BAS and LLM tools, cutting data-processing time and operator workload by 49%.",
          "Built a SQLite-backed ingestion pipeline to process and integrate real-time BAS streams reliably.",
          "Partnered with Delta Controls and Carleton University to deliver AI building agents, achieving a 56% reduction in maintenance costs via automated fault detection, predictive maintenance, and real-time alerts.",
        ],
      },
      {
        name: "Enhanced Utilities Chatbot",
        bullets: [
          "Built a multi-agent, tool-using utilities chatbot that explains bills, simulates alternate rate plans, and diagnoses anomalies by linking AMI data with weather/holidays/tariffs for a $3M+ annual revenue company.",
          "Implemented a time-series engine (seasonal decomposition + change-point detection) to flag spikes, persistent baseload, and overnight leaks, then auto-generate plain-English \"why it happened\" narratives and savings playbooks.",
        ],
      },
    ],
  },
  {
    id: "ta",
    role: "Teaching Assistant",
    company: "University of Ottawa",
    short: "uOttawa · TA",
    url: "https://www.uottawa.ca/en",
    location: "Ottawa, ON",
    period: "Sept 2023 – Present",
    start: [2023, 8],
    end: null,
    summary: "Graduate ML and undergraduate algorithms courses.",
    metric: { value: "10+", label: "classes taught" },
    stack: ["Machine learning", "Bioinformatics", "Algorithms", "Paradigms"],
    groups: [
      {
        bullets: [
          "Assisted in teaching graduate classes (Machine Learning for Bio-informatics) and undergraduate courses (Data Structures & Algorithms, Design & Analysis of Algorithms, Programming Paradigms).",
        ],
      },
    ],
  },
  {
    id: "wind",
    role: "Junior Software Engineer",
    company: "Wind River Systems",
    short: "Wind River",
    url: "https://www.windriver.com/",
    location: "Ottawa, ON",
    period: "Sept 2022 – Aug 2023",
    start: [2022, 8],
    end: [2023, 8],
    summary: "An automation dashboard, end to end.",
    metric: { value: "90%", label: "faster queries & UI" },
    stack: ["Angular", "TypeScript", "Django", "PostgreSQL"],
    groups: [
      {
        bullets: [
          "Designed and implemented an Automation Dashboard using Angular, TypeScript, and Django, with a PostgreSQL database.",
          "Achieved over 90% faster query execution and UI responsiveness by optimizing API endpoints and reducing frontend rendering times.",
        ],
      },
    ],
  },
  {
    id: "uo-dev",
    role: "Software Developer",
    company: "University of Ottawa",
    short: "uOttawa · Dev",
    url: "https://www.uottawa.ca/en",
    location: "Ottawa, ON",
    period: "May 2022 – Apr 2024",
    start: [2022, 4],
    end: [2024, 4],
    summary: "Rebuilt the university's search engine.",
    metric: { value: "80%", label: "faster search responses" },
    stack: ["PHP", "MySQL", "Apache", "Bash", "Cron"],
    groups: [
      {
        bullets: [
          "Redesigned and optimized the university's search engine using PHP, MySQL, and Apache, improving query response times by 80%.",
          "Developed automation scripts using PHP, Bash, and Cron jobs to enhance search speed by 54%.",
        ],
      },
    ],
  },
];

export type Degree = {
  id: "msc" | "basc";
  short: string;
  field: string;
  /** Display lines for the panel heading. */
  title: [string, string];
  institution: string;
  period: string;
  status: string;
  start: YearMonth;
  end: YearMonth; // exclusive
  thesis?: string;
  supervisor?: string;
  funding?: { amount: string; label: string };
  coursework?: { name: string; area: string }[];
};

export const degrees: Degree[] = [
  {
    id: "basc",
    short: "B.A.Sc.",
    field: "Software Engineering",
    title: ["Bachelor of", "Applied Science"],
    institution: "University of Ottawa",
    period: "Sept 2020 — Dec 2024",
    status: "Conferred",
    start: [2020, 8],
    end: [2025, 0],
    coursework: [
      { name: "Data Structures & Algorithms", area: "Theory" },
      { name: "Discrete Mathematics", area: "Theory" },
      { name: "Embedded Systems", area: "Systems" },
      { name: "Real-Time Systems Design", area: "Systems" },
      { name: "Databases", area: "Data" },
      { name: "Enterprise Architecture", area: "Architecture" },
    ],
  },
  {
    id: "msc",
    short: "M.Sc.",
    field: "Computer Science",
    title: ["Master of", "Computer Science"],
    institution: "University of Ottawa",
    period: "Jan 2025 — Dec 2026",
    status: "In progress, expected Dec 2026",
    start: [2025, 0],
    end: [2027, 0],
    thesis: "Minimum Feature Size in Proper Triangulations: A tight logarithmic bound",
    supervisor: "Vida Dujmović",
    funding: { amount: "$52,000+", label: "in scholarships" },
  },
];
