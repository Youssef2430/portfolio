"use client";

import { type ReactNode, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Chrome,
  Cpu,
  Database,
  LockKeyhole,
  Mail,
  Network,
  Server,
  ShieldCheck,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { SerializableProject } from "@/components/project-detail";

const EASE = [0.16, 1, 0.3, 1] as const;
const REPO_URL =
  "https://github.com/capstone-2024-T91/Image-Processing-and-NLP-for-Brand-Protection";
const EXTENSION_REPO_URL = "https://github.com/capstone-2024-T91/Frontend-Backend";
const SAFE_SHOT = "/NLP-phishing/capstone";
const PHISHING_SHOT = "/NLP-phishing/capstone-phishing";

type IconItem = {
  Icon: LucideIcon;
  name: string;
  detail: string;
};

const CAPABILITIES = [
  "Gmail extension",
  "Fine-tuned RoBERTa",
  "Local DistilBERT",
  "OpenAI adapter",
  "Claude adapter",
  "Docker deployment",
];

const METRICS = [
  {
    value: "5",
    label: "Inference Backends",
    detail: "local · roberta · openai · claude · ollama",
  },
  {
    value: "2",
    label: "Fine-Tuned HF Models",
    detail: "DistilBERT and RoBERTa checkpoints",
  },
  {
    value: "3.75M",
    label: "Processed CSV Rows",
    detail: "train and test splits across four datasets",
  },
  {
    value: "MV3",
    label: "Chrome Extension Surface",
    detail: "the verdict badge lands beside the open Gmail message",
  },
];

const MODEL_ROOM: IconItem[] = [
  {
    Icon: Cpu,
    name: "Local DistilBERT",
    detail: "Default on-device-style classifier, loaded from the fine-tuned model folder.",
  },
  {
    Icon: BrainCircuit,
    name: "RoBERTa",
    detail: "A second transformer path for sequence classification and comparison.",
  },
  {
    Icon: Network,
    name: "OpenAI model",
    detail: "Fine-tuned OpenAI adapter with the same phishing/safe response contract.",
  },
  {
    Icon: ShieldCheck,
    name: "Claude",
    detail: "Prompted classifier path for Anthropic evaluation and fallback testing.",
  },
  {
    Icon: Terminal,
    name: "Ollama",
    detail: "Local LLM route that can run llama3 or another installed model from the CLI.",
  },
];

const DEPLOYMENT: IconItem[] = [
  {
    Icon: Server,
    name: "Flask API",
    detail: "Models are preloaded at startup, then served through GET /detect_phishing.",
  },
  {
    Icon: LockKeyhole,
    name: "Nginx + SSL",
    detail: "g30.xyz sat in front of the detector with a Let's Encrypt certificate.",
  },
  {
    Icon: Chrome,
    name: "Chrome extension",
    detail: "The browser surface reads the open email, calls the API, and injects the result.",
  },
];

type TechMark = {
  name: string;
  tag: string;
  path: string;
};

const PYTHON_ICON_PATH =
  "M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z";
const HUGGING_FACE_ICON_PATH =
  "M12.025 1.13c-5.77 0-10.449 4.647-10.449 10.378 0 1.112.178 2.181.503 3.185.064-.222.203-.444.416-.577a.96.96 0 0 1 .524-.15c.293 0 .584.124.84.284.278.173.48.408.71.694.226.282.458.611.684.951v-.014c.017-.324.106-.622.264-.874s.403-.487.762-.543c.3-.047.596.06.787.203s.31.313.4.467c.15.257.212.468.233.542.01.026.653 1.552 1.657 2.54.616.605 1.01 1.223 1.082 1.912.055.537-.096 1.059-.38 1.572.637.121 1.294.187 1.967.187.657 0 1.298-.063 1.921-.178-.287-.517-.44-1.041-.384-1.581.07-.69.465-1.307 1.081-1.913 1.004-.987 1.647-2.513 1.657-2.539.021-.074.083-.285.233-.542.09-.154.208-.323.4-.467a1.08 1.08 0 0 1 .787-.203c.359.056.604.29.762.543s.247.55.265.874v.015c.225-.34.457-.67.683-.952.23-.286.432-.52.71-.694.257-.16.547-.284.84-.285a.97.97 0 0 1 .524.151c.228.143.373.388.43.625l.006.04a10.3 10.3 0 0 0 .534-3.273c0-5.731-4.678-10.378-10.449-10.378M8.327 6.583a1.5 1.5 0 0 1 .713.174 1.487 1.487 0 0 1 .617 2.013c-.183.343-.762-.214-1.102-.094-.38.134-.532.914-.917.71a1.487 1.487 0 0 1 .69-2.803m7.486 0a1.487 1.487 0 0 1 .689 2.803c-.385.204-.536-.576-.916-.71-.34-.12-.92.437-1.103.094a1.487 1.487 0 0 1 .617-2.013 1.5 1.5 0 0 1 .713-.174m-10.68 1.55a.96.96 0 1 1 0 1.921.96.96 0 0 1 0-1.92m13.838 0a.96.96 0 1 1 0 1.92.96.96 0 0 1 0-1.92M8.489 11.458c.588.01 1.965 1.157 3.572 1.164 1.607-.007 2.984-1.155 3.572-1.164.196-.003.305.12.305.454 0 .886-.424 2.328-1.563 3.202-.22-.756-1.396-1.366-1.63-1.32q-.011.001-.02.006l-.044.026-.01.008-.03.024q-.018.017-.035.036l-.032.04a1 1 0 0 0-.058.09l-.014.025q-.049.088-.11.19a1 1 0 0 1-.083.116 1.2 1.2 0 0 1-.173.18q-.035.029-.075.058a1.3 1.3 0 0 1-.251-.243 1 1 0 0 1-.076-.107c-.124-.193-.177-.363-.337-.444-.034-.016-.104-.008-.2.022q-.094.03-.216.087-.06.028-.125.063l-.13.074q-.067.04-.136.086a3 3 0 0 0-.135.096 3 3 0 0 0-.26.219 2 2 0 0 0-.12.121 2 2 0 0 0-.106.128l-.002.002a2 2 0 0 0-.09.132l-.001.001a1.2 1.2 0 0 0-.105.212q-.013.036-.024.073c-1.139-.875-1.563-2.317-1.563-3.203 0-.334.109-.457.305-.454m.836 10.354c.824-1.19.766-2.082-.365-3.194-1.13-1.112-1.789-2.738-1.789-2.738s-.246-.945-.806-.858-.97 1.499.202 2.362c1.173.864-.233 1.45-.685.64-.45-.812-1.683-2.896-2.322-3.295s-1.089-.175-.938.647 2.822 2.813 2.562 3.244-1.176-.506-1.176-.506-2.866-2.567-3.49-1.898.473 1.23 2.037 2.16c1.564.932 1.686 1.178 1.464 1.53s-3.675-2.511-4-1.297c-.323 1.214 3.524 1.567 3.287 2.405-.238.839-2.71-1.587-3.216-.642-.506.946 3.49 2.056 3.522 2.064 1.29.33 4.568 1.028 5.713-.624m5.349 0c-.824-1.19-.766-2.082.365-3.194 1.13-1.112 1.789-2.738 1.789-2.738s.246-.945.806-.858.97 1.499-.202 2.362c-1.173.864.233 1.45.685.64.451-.812 1.683-2.896 2.322-3.295s1.089-.175.938.647-2.822 2.813-2.562 3.244 1.176-.506 1.176-.506 2.866-2.567 3.49-1.898-.473 1.23-2.037 2.16c-1.564.932-1.686 1.178-1.464 1.53s3.675-2.511 4-1.297c.323 1.214-3.524 1.567-3.287 2.405.238.839 2.71-1.587 3.216-.642.506.946-3.49 2.056-3.522 2.064-1.29.33-4.568 1.028-5.713-.624";
const PYTORCH_ICON_PATH =
  "M12.005 0L4.952 7.053a9.865 9.865 0 000 14.022 9.866 9.866 0 0014.022 0c3.984-3.9 3.986-10.205.085-14.023l-1.744 1.743c2.904 2.905 2.904 7.634 0 10.538s-7.634 2.904-10.538 0-2.904-7.634 0-10.538l4.647-4.646.582-.665zm3.568 3.899a1.327 1.327 0 00-1.327 1.327 1.327 1.327 0 001.327 1.328A1.327 1.327 0 0016.9 5.226 1.327 1.327 0 0015.573 3.9z";
const OPENAI_ICON_PATH =
  "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654 2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997z";
const ANTHROPIC_ICON_PATH =
  "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z";
const OLLAMA_ICON_PATH =
  "M16.361 10.26a.894.894 0 0 0-.558.47l-.072.148.001.207c0 .193.004.217.059.353.076.193.152.312.291.448.24.238.51.3.872.205a.86.86 0 0 0 .517-.436.752.752 0 0 0 .08-.498c-.064-.453-.33-.782-.724-.897a1.06 1.06 0 0 0-.466 0zm-9.203.005c-.305.096-.533.32-.65.639a1.187 1.187 0 0 0-.06.52c.057.309.31.59.598.667.362.095.632.033.872-.205.14-.136.215-.255.291-.448.055-.136.059-.16.059-.353l.001-.207-.072-.148a.894.894 0 0 0-.565-.472 1.02 1.02 0 0 0-.474.007Zm4.184 2c-.131.071-.223.25-.195.383.031.143.157.288.353.407.105.063.112.072.117.136.004.038-.01.146-.029.243-.02.094-.036.194-.036.222.002.074.07.195.143.253.064.052.076.054.255.059.164.005.198.001.264-.03.169-.082.212-.234.15-.525-.052-.243-.042-.28.087-.355.137-.08.281-.219.324-.314a.365.365 0 0 0-.175-.48.394.394 0 0 0-.181-.033c-.126 0-.207.03-.355.124l-.085.053-.053-.032c-.219-.13-.259-.145-.391-.143a.396.396 0 0 0-.193.032zm.39-2.195c-.373.036-.475.05-.654.086-.291.06-.68.195-.951.328-.94.46-1.589 1.226-1.787 2.114-.04.176-.045.234-.045.53 0 .294.005.357.043.524.264 1.16 1.332 2.017 2.714 2.173.3.033 1.596.033 1.896 0 1.11-.125 2.064-.727 2.493-1.571.114-.226.169-.372.22-.602.039-.167.044-.23.044-.523 0-.297-.005-.355-.045-.531-.288-1.29-1.539-2.304-3.072-2.497a6.873 6.873 0 0 0-.855-.031zm.645.937a3.283 3.283 0 0 1 1.44.514c.223.148.537.458.671.662.166.251.26.508.303.82.02.143.01.251-.043.482-.08.345-.332.705-.672.957a3.115 3.115 0 0 1-.689.348c-.382.122-.632.144-1.525.138-.582-.006-.686-.01-.853-.042-.57-.107-1.022-.334-1.35-.68-.264-.28-.385-.535-.45-.946-.03-.192.025-.509.137-.776.136-.326.488-.73.836-.963.403-.269.934-.46 1.422-.512.187-.02.586-.02.773-.002zm-5.503-11a1.653 1.653 0 0 0-.683.298C5.617.74 5.173 1.666 4.985 2.819c-.07.436-.119 1.04-.119 1.503 0 .544.064 1.24.155 1.721.02.107.031.202.023.208a8.12 8.12 0 0 1-.187.152 5.324 5.324 0 0 0-.949 1.02 5.49 5.49 0 0 0-.94 2.339 6.625 6.625 0 0 0-.023 1.357c.091.78.325 1.438.727 2.04l.13.195-.037.064c-.269.452-.498 1.105-.605 1.732-.084.496-.095.629-.095 1.294 0 .67.009.803.088 1.266.095.555.288 1.143.503 1.534.071.128.243.393.264.407.007.003-.014.067-.046.141a7.405 7.405 0 0 0-.548 1.873c-.062.417-.071.552-.071.991 0 .56.031.832.148 1.279L3.42 24h1.478l-.05-.091c-.297-.552-.325-1.575-.068-2.597.117-.472.25-.819.498-1.296l.148-.29v-.177c0-.165-.003-.184-.057-.293a.915.915 0 0 0-.194-.25 1.74 1.74 0 0 1-.385-.543c-.424-.92-.506-2.286-.208-3.451.124-.486.329-.918.544-1.154a.787.787 0 0 0 .223-.531c0-.195-.07-.355-.224-.522a3.136 3.136 0 0 1-.817-1.729c-.14-.96.114-2.005.69-2.834.563-.814 1.353-1.336 2.237-1.475.199-.033.57-.028.776.01.226.04.367.028.512-.041.179-.085.268-.19.374-.431.093-.215.165-.333.36-.576.234-.29.46-.489.822-.729.413-.27.884-.467 1.352-.561.17-.035.25-.04.569-.04.319 0 .398.005.569.04a4.07 4.07 0 0 1 1.914.997c.117.109.398.457.488.602.034.057.095.177.132.267.105.241.195.346.374.43.14.068.286.082.503.045.343-.058.607-.053.943.016 1.144.23 2.14 1.173 2.581 2.437.385 1.108.276 2.267-.296 3.153-.097.15-.193.27-.333.419-.301.322-.301.722-.001 1.053.493.539.801 1.866.708 3.036-.062.772-.26 1.463-.533 1.854a2.096 2.096 0 0 1-.224.258.916.916 0 0 0-.194.25c-.054.109-.057.128-.057.293v.178l.148.29c.248.476.38.823.498 1.295.253 1.008.231 2.01-.059 2.581a.845.845 0 0 0-.044.098c0 .006.329.009.732.009h.73l.02-.074.036-.134c.019-.076.057-.3.088-.516.029-.217.029-1.016 0-1.258-.11-.875-.295-1.57-.597-2.226-.032-.074-.053-.138-.046-.141.008-.005.057-.074.108-.152.376-.569.607-1.284.724-2.228.031-.26.031-1.378 0-1.628-.083-.645-.182-1.082-.348-1.525a6.083 6.083 0 0 0-.329-.7l-.038-.064.131-.194c.402-.604.636-1.262.727-2.04a6.625 6.625 0 0 0-.024-1.358 5.512 5.512 0 0 0-.939-2.339 5.325 5.325 0 0 0-.95-1.02 8.097 8.097 0 0 1-.186-.152.692.692 0 0 1 .023-.208c.208-1.087.201-2.443-.017-3.503-.19-.924-.535-1.658-.98-2.082-.354-.338-.716-.482-1.15-.455-.996.059-1.8 1.205-2.116 3.01a6.805 6.805 0 0 0-.097.726c0 .036-.007.066-.015.066a.96.96 0 0 1-.149-.078A4.857 4.857 0 0 0 12 3.03c-.832 0-1.687.243-2.456.698a.958.958 0 0 1-.148.078c-.008 0-.015-.03-.015-.066a6.71 6.71 0 0 0-.097-.725C8.997 1.392 8.337.319 7.46.048a2.096 2.096 0 0 0-.585-.041Zm.293 1.402c.248.197.523.759.682 1.388.03.113.06.244.069.292.007.047.026.152.041.233.067.365.098.76.102 1.24l.002.475-.12.175-.118.178h-.278c-.324 0-.646.041-.954.124l-.238.06c-.033.007-.038-.003-.057-.144a8.438 8.438 0 0 1 .016-2.323c.124-.788.413-1.501.696-1.711.067-.05.079-.049.157.013zm9.825-.012c.17.126.358.46.498.888.28.854.36 2.028.212 3.145-.019.14-.024.151-.057.144l-.238-.06a3.693 3.693 0 0 0-.954-.124h-.278l-.119-.178-.119-.175.002-.474c.004-.669.066-1.19.214-1.772.157-.623.434-1.185.68-1.382.078-.062.09-.063.159-.012z";
const FLASK_ICON_PATH =
  "M10.773 2.878c-.013 1.434.322 4.624.445 5.734l-8.558 3.83c-.56-.959-.98-2.304-1.237-3.38l-.06.027c-.205.09-.406.053-.494-.088l-.011-.018-.82-1.506c-.058-.105-.05-.252.024-.392a.78.78 0 0 1 .358-.331l9.824-4.207c.146-.064.299-.063.4.004.106.062.127.128.13.327Zm.68 7c.523 1.97.675 2.412.832 2.818l-7.263 3.7a19.35 19.35 0 0 1-1.81-2.83l8.24-3.689Zm12.432 8.786h.003c.283.402-.047.657-.153.698l-.947.37c.037.125.035.319-.217.414l-.736.287c-.229.09-.398-.059-.42-.2l-.025-.125c-4.427 1.784-7.94 1.685-10.696.647-1.981-.745-3.576-1.983-4.846-3.379l6.948-3.54c.721 1.431 1.586 2.454 2.509 3.178 2.086 1.638 4.415 1.712 5.793 1.563l-.047-.233c-.015-.077.007-.135.086-.165l.734-.288a.302.302 0 0 1 .342.086l.748-.288a.306.306 0 0 1 .341.086l.583.89Z";
const DOCKER_ICON_PATH =
  "M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z";
const NGINX_ICON_PATH =
  "M12 0L1.605 6v12L12 24l10.395-6V6L12 0zm6 16.59c0 .705-.646 1.29-1.529 1.29-.631 0-1.351-.255-1.801-.81l-6-7.141v6.66c0 .721-.57 1.29-1.274 1.29H7.32c-.721 0-1.29-.6-1.29-1.29V7.41c0-.705.63-1.29 1.5-1.29.646 0 1.38.255 1.83.81l5.97 7.141V7.41c0-.721.6-1.29 1.29-1.29h.075c.72 0 1.29.6 1.29 1.29v9.18H18z";
const CHROME_ICON_PATH =
  "M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z";
const WANDB_ICON_PATH =
  "M2.48 0a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1zm19.04 0a1.55 1.55 0 1 0 0 3.101 1.55 1.55 0 0 0 0-3.101zM12 2.295a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1zM2.48 5.272a2.48 2.48 0 1 0 0 4.96 2.48 2.48 0 0 0 0-4.96zm19.04 0a2.48 2.48 0 1 0 0 4.96 2.48 2.48 0 0 0 0-4.96zM12 8.496a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1zm-9.52 3.907a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1zm19.04 0a1.55 1.55 0 1 0 0 3.102 1.55 1.55 0 0 0 0-3.102zM12 13.767a2.48 2.48 0 1 0 0 4.962 2.48 2.48 0 0 0 0-4.962zm-9.52 3.907a2.48 2.48 0 1 0 .001 4.962 2.48 2.48 0 0 0 0-4.962zm19.04.93a1.55 1.55 0 1 0 0 3.102 1.55 1.55 0 0 0 0-3.101zM12 20.9a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1Z";

const TECH: TechMark[] = [
  { name: "Python", tag: "Language", path: PYTHON_ICON_PATH },
  { name: "Transformers", tag: "NLP models", path: HUGGING_FACE_ICON_PATH },
  { name: "PyTorch", tag: "Training", path: PYTORCH_ICON_PATH },
  { name: "RoBERTa", tag: "Classifier", path: HUGGING_FACE_ICON_PATH },
  { name: "DistilBERT", tag: "Classifier", path: HUGGING_FACE_ICON_PATH },
  { name: "OpenAI", tag: "LLM adapter", path: OPENAI_ICON_PATH },
  { name: "Anthropic", tag: "LLM adapter", path: ANTHROPIC_ICON_PATH },
  { name: "Ollama", tag: "Local LLM", path: OLLAMA_ICON_PATH },
  { name: "Flask", tag: "API", path: FLASK_ICON_PATH },
  { name: "Docker", tag: "Container", path: DOCKER_ICON_PATH },
  { name: "Nginx", tag: "Reverse proxy", path: NGINX_ICON_PATH },
  { name: "Chrome MV3", tag: "Extension", path: CHROME_ICON_PATH },
  { name: "W&B", tag: "Evaluation", path: WANDB_ICON_PATH },
];

const SAMPLES = [
  {
    id: "safe",
    label: "Safe",
    tone: "safe",
    title: "Known sender, expected context",
    sender: "no-reply@robinhood.com",
    subject: "Important information about your application",
    body:
      "Hi Tawfiq, thank you for taking the time to apply. We wanted to let you know that we are no longer accepting applications for the New Grad, Toronto position.",
    phishing: 1.6,
    safe: 98.4,
    signals: ["verified sender", "no credential request", "no payment pressure"],
  },
  {
    id: "phishing",
    label: "Phishing",
    tone: "danger",
    title: "Impersonation with urgency",
    sender: "security-payments@rnicrosoft-login.co",
    subject: "Account access suspended",
    body:
      "Your account has been restricted. Confirm your identity within 30 minutes at http://rnicrosoft-login.co/verify or your mailbox will be deleted.",
    phishing: 96.8,
    safe: 3.2,
    signals: ["lookalike domain", "deadline pressure", "credential link"],
  },
];

const FLOW = [
  {
    Icon: Chrome,
    id: "gmail",
    label: "Gmail DOM",
    detail: "Open message surface",
    x: 5,
    y: 10,
  },
  {
    Icon: Mail,
    id: "script",
    label: "Content script",
    detail: "Reads .a3s and selectedModel",
    x: 24,
    y: 10,
  },
  {
    Icon: Network,
    id: "request",
    label: "HTTPS request",
    detail: "email_text + model_option",
    x: 43,
    y: 10,
  },
  {
    Icon: Server,
    id: "api",
    label: "Flask API",
    detail: "Preloaded inference workers",
    x: 62,
    y: 10,
  },
  {
    Icon: Database,
    id: "clean",
    label: "Preprocess",
    detail: "URL strip + lowercase normalize",
    x: 76,
    y: 38,
  },
  {
    Icon: BrainCircuit,
    id: "router",
    label: "Model router",
    detail: "local · roberta · openai · claude · ollama",
    x: 62,
    y: 66,
  },
  {
    Icon: Cpu,
    id: "local",
    label: "HF models",
    detail: "DistilBERT / RoBERTa logits",
    x: 43,
    y: 66,
  },
  {
    Icon: Terminal,
    id: "llm",
    label: "LLM adapters",
    detail: "OpenAI model, Claude, Ollama",
    x: 24,
    y: 66,
  },
  {
    Icon: ShieldCheck,
    id: "badge",
    label: "Inbox badge",
    detail: "Safe or Caution JSON verdict",
    x: 5,
    y: 66,
  },
];

function Label({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <span className="phish-mono inline-flex items-center gap-3 text-[11px] uppercase text-[hsl(var(--foreground-subtle))]">
      {index && (
        <span className="inline-flex items-center gap-3 text-[hsl(var(--gold))]">
          {index}
          <span className="inline-block h-px w-8 bg-[hsl(var(--gold))]" />
        </span>
      )}
      {children}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function NLPPhishingExperience({
  project,
}: {
  project: SerializableProject;
}) {
  return (
    <main className="phish-theme min-h-screen overflow-clip bg-background text-foreground">
      <div className="grain-overlay" />
      <Navbar />

      <section className="phish-hero px-6 pt-32 md:px-12 md:pt-40">
        <div className="relative z-[1] mx-auto max-w-6xl">
          <Link
            href="/#work"
            className="group phish-mono inline-flex items-center text-xs uppercase text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Work
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mt-12 flex items-center gap-3"
          >
            <span className="phish-mark">G30</span>
            <div>
              <p className="phish-mono text-[11px] uppercase text-[hsl(var(--foreground-subtle))]">
                Brand protection capstone
              </p>
              <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
                NLP Phishing Detection
              </h1>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="phish-display mt-8 max-w-4xl text-5xl leading-none text-foreground md:text-7xl"
          >
            Safe or Caution, right in the inbox.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-[hsl(var(--foreground-soft))] md:text-xl"
          >
            A capstone system that turns an open email into a security signal:
            clean the text, route it through fine-tuned classifiers or LLM
            adapters, and badge the verdict directly in Gmail.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="phish-mono mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6 text-[11px] uppercase text-[hsl(var(--foreground-subtle))]"
          >
            <span>{project.timeline ?? "Capstone project"}</span>
            <span>Group 30 · g30.xyz</span>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[hsl(var(--gold))] transition-colors hover:text-foreground"
            >
              Detector source
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href={EXTENSION_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground"
            >
              Extension source
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            className="phish-hero-field mt-14 border border-border p-4 md:p-8"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <ThemedScreenshot
                  baseSrc={SAFE_SHOT}
                  alt="Gmail message with a phishing risk button and Safe result badge"
                  priority
                  sizes="(max-width: 1024px) 100vw, 45rem"
                  className="aspect-[16/9]"
                />
              </div>
              <div className="lg:col-span-5">
                <HeroReadout />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <Label>Overview</Label>
          </Reveal>
          <div className="space-y-6 lg:col-span-8">
            <Reveal>
              <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                The detector is a model bench and production path in one repo:
                DistilBERT and RoBERTa fine-tunes, OpenAI and Claude adapters,
                an Ollama route, W&B-backed evaluation, and a Flask API that
                preloads every model before serving requests.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                The companion Chrome extension watches for the currently opened
                Gmail message, extracts the email body, sends it to the deployed
                detector, and renders the answer beside the message toolbar.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-wrap gap-2 pt-2">
                {CAPABILITIES.map((capability) => (
                  <span
                    key={capability}
                    className="phish-mono border border-border px-3 py-1.5 text-xs text-[hsl(var(--foreground-soft))]"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.14} className="mx-auto mt-14 max-w-6xl">
          <ScreenshotGallery />
        </Reveal>
      </section>

      <section className="border-y border-border px-6 py-16 md:px-12">
        <StatsPanel />
      </section>

      <section className="px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label index="01">Classifier readout</Label>
              <h2 className="phish-display mt-5 text-4xl leading-tight text-foreground md:text-5xl">
                Text preprocessing and classification.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                Every path starts by simplifying the raw message: URLs and
                punctuation are stripped, casing is normalized, and the result
                is fed into a sequence classifier or model adapter with a strict
                phishing/safe output contract.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <ScannerDemo />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label index="02">System path</Label>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                The architecture is intentionally direct: browser content script,
                text cleaning, model selection, preloaded Flask backend, JSON
                result, and a badge inserted back into Gmail.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <Pipeline />
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-12">
            <Label index="03">Model backends</Label>
            <h2 className="phish-display mt-5 text-4xl leading-tight text-foreground md:text-5xl">
              Inference options implemented in the detector.
            </h2>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-5">
              {MODEL_ROOM.map(({ Icon, name, detail }) => (
                <div
                  key={name}
                  className="group bg-card p-5 transition-colors hover:bg-[hsl(var(--phish-ink-soft))]"
                >
                  <Icon
                    className="h-5 w-5 text-[hsl(var(--gold))]"
                    strokeWidth={1.6}
                  />
                  <h3 className="mt-4 text-sm font-semibold text-foreground">
                    {name}
                  </h3>
                  <p className="mt-2 text-[13px] leading-snug text-[hsl(var(--foreground-soft))]">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label index="04">Deployment</Label>
              <h2 className="phish-display mt-5 text-4xl leading-tight text-foreground md:text-5xl">
                Containerized service and browser integration.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                The final system ran as a containerized service on a Hetzner VPS,
                behind Nginx and SSL so the Chrome extension could call it from a
                normal browser session.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <Reveal>
              <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
                {DEPLOYMENT.map(({ Icon, name, detail }) => (
                  <div key={name} className="bg-card p-5">
                    <Icon
                      className="h-5 w-5 text-[hsl(var(--gold))]"
                      strokeWidth={1.6}
                    />
                    <h3 className="mt-4 text-sm font-semibold text-foreground">
                      {name}
                    </h3>
                    <p className="mt-2 text-[13px] leading-snug text-[hsl(var(--foreground-soft))]">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-border px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10">
            <Label>Built with</Label>
          </Reveal>
          <Reveal delay={0.05}>
            <PhishTechStack />
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-28 pt-20 md:px-12 md:pt-24">
        <div className="mx-auto max-w-6xl border-t border-border pt-14">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="phish-mark phish-mark-small">G30</span>
              <span className="text-lg font-semibold">NLP Phishing Detection</span>
            </div>

            <div className="phish-mono flex flex-wrap items-center gap-x-8 gap-y-3 text-xs uppercase">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[hsl(var(--gold))] transition-colors hover:text-foreground"
              >
                Detector source
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href={EXTENSION_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground"
              >
                Extension source
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <Link
              href="/#work"
              className="group phish-mono inline-flex items-center text-sm uppercase text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              All Projects
            </Link>
            <span className="font-arabic text-sm text-[hsl(var(--gold))] opacity-60">
              「مشروع」
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function StatsPanel() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.55, delay: index * 0.05, ease: EASE }}
            className="group relative min-h-[178px] bg-card p-5 transition-colors hover:bg-[hsl(var(--phish-ink-soft))] md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="phish-display phish-stat-value text-[hsl(var(--gold))]">
                {metric.value}
              </p>
              <span className="phish-mono mt-2 text-[10px] text-[hsl(var(--foreground-subtle))]">
                0{index + 1}
              </span>
            </div>
            <p className="phish-mono mt-4 max-w-[12rem] text-[11px] uppercase leading-relaxed text-[hsl(var(--foreground-muted))]">
              {metric.label}
            </p>
            <p className="mt-4 max-w-[14rem] text-[13px] leading-snug text-[hsl(var(--foreground-soft))]">
              {metric.detail}
            </p>
            <span
              className="absolute bottom-4 right-4 h-2 w-2 border border-[hsl(var(--gold))]/60 bg-[hsl(var(--gold))]/20 opacity-50 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HeroReadout() {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="phish-mono text-[11px] uppercase text-[hsl(var(--foreground-subtle))]">
            Live verdict
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">Safe</p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center border border-[hsl(var(--phish-safe))]/50 bg-[hsl(var(--phish-safe)/0.14)] text-[hsl(var(--phish-safe))]">
          <CheckCircle2 className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <SignalBar label="Legitimate" value={98.4} tone="safe" />
        <SignalBar label="Phishing" value={1.6} tone="danger" />
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <p className="phish-mono text-[11px] uppercase text-[hsl(var(--foreground-subtle))]">
          Model option
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--foreground-soft))]">
          local · distilbert-base-uncased_fine_tuned · badge injected by the
          Chrome content script
        </p>
      </div>
    </div>
  );
}

function ThemedScreenshot({
  baseSrc,
  alt,
  priority = false,
  sizes,
  className = "",
}: {
  baseSrc: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden border border-border bg-[hsl(var(--background))] ${className}`}
    >
      <Image
        src={`${baseSrc}-light.png`}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain dark:hidden"
      />
      <Image
        src={`${baseSrc}-dark.png`}
        alt=""
        aria-hidden
        fill
        priority={priority}
        sizes={sizes}
        className="hidden object-contain dark:block"
      />
    </div>
  );
}

function ScreenshotGallery() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <figure className="border border-border bg-card p-3">
        <ThemedScreenshot
          baseSrc={SAFE_SHOT}
          alt="Legitimate Gmail message marked Safe by the phishing detector"
          sizes="(max-width: 768px) 100vw, 34rem"
          className="aspect-[16/9]"
        />
        <figcaption className="phish-mono mt-3 flex items-center justify-between gap-4 text-[11px] uppercase text-[hsl(var(--foreground-subtle))]">
          <span>Legitimate message</span>
          <span className="text-[hsl(var(--phish-safe))]">Safe badge</span>
        </figcaption>
      </figure>

      <figure className="border border-border bg-card p-3">
        <ThemedScreenshot
          baseSrc={PHISHING_SHOT}
          alt="Suspicious Gmail message marked Unsafe and Dangerous by the phishing detector"
          sizes="(max-width: 768px) 100vw, 34rem"
          className="aspect-[16/9]"
        />
        <figcaption className="phish-mono mt-3 flex items-center justify-between gap-4 text-[11px] uppercase text-[hsl(var(--foreground-subtle))]">
          <span>Phishing attempt</span>
          <span className="text-[hsl(var(--phish-danger))]">Unsafe badge</span>
        </figcaption>
      </figure>
    </div>
  );
}

function ScannerDemo() {
  const [selectedId, setSelectedId] = useState(SAMPLES[0].id);
  const sample = SAMPLES.find((item) => item.id === selectedId) ?? SAMPLES[0];

  const processed = useMemo(() => {
    return sample.body
      .replace(/http\S+/g, "")
      .replace(/[^A-Za-z0-9\s]+/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }, [sample.body]);

  const isDanger = sample.tone === "danger";

  return (
    <div className="grid grid-cols-1 border border-border bg-card lg:grid-cols-12">
      <div className="border-b border-border p-5 lg:col-span-5 lg:border-b-0 lg:border-r">
        <div className="mb-5 flex flex-wrap gap-2">
          {SAMPLES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`phish-mono border px-3 py-2 text-xs uppercase transition-colors ${
                selectedId === item.id
                  ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.12)] text-foreground"
                  : "border-border text-[hsl(var(--foreground-muted))] hover:text-foreground"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="border border-border bg-[hsl(var(--background))] p-4">
          <div className="mb-4 flex items-start gap-3 border-b border-border pb-4">
            <span className="mt-1 inline-flex h-9 w-9 items-center justify-center border border-border bg-card text-[hsl(var(--gold))]">
              <Mail className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {sample.sender}
              </p>
              <p className="mt-1 truncate text-sm text-[hsl(var(--foreground-soft))]">
                {sample.subject}
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[hsl(var(--foreground-soft))]">
            {sample.body}
          </p>
        </div>
      </div>

      <div className="p-5 lg:col-span-7">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <p className="phish-mono text-[11px] uppercase text-[hsl(var(--foreground-subtle))]">
              Preprocessed
            </p>
            <pre className="phish-mono mt-3 min-h-[138px] whitespace-pre-wrap break-words border border-border bg-[hsl(var(--background))] p-4 text-xs leading-relaxed text-[hsl(var(--foreground-soft))]">
              <code>{processed}</code>
            </pre>
          </div>

          <div>
            <p className="phish-mono text-[11px] uppercase text-[hsl(var(--foreground-subtle))]">
              Verdict
            </p>
            <div
              className={`mt-3 border p-4 ${
                isDanger
                  ? "border-[hsl(var(--phish-danger))]/60 bg-[hsl(var(--phish-danger)/0.12)]"
                  : "border-[hsl(var(--phish-safe))]/60 bg-[hsl(var(--phish-safe)/0.12)]"
              }`}
            >
              <div className="flex items-center gap-3">
                {isDanger ? (
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--phish-danger))]" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--phish-safe))]" />
                )}
                <div>
                  <p className="text-xl font-semibold text-foreground">
                    {sample.label}
                  </p>
                  <p className="phish-mono mt-1 text-[11px] uppercase text-[hsl(var(--foreground-subtle))]">
                    {isDanger ? sample.phishing : sample.safe}% confidence
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <SignalBar label="Phishing" value={sample.phishing} tone="danger" />
              <SignalBar label="Safe" value={sample.safe} tone="safe" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {sample.signals.map((signal) => (
            <span
              key={signal}
              className="phish-mono border border-border px-3 py-1.5 text-xs text-[hsl(var(--foreground-soft))]"
            >
              {signal}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SignalBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "safe" | "danger";
}) {
  const color =
    tone === "safe" ? "hsl(var(--phish-safe))" : "hsl(var(--phish-danger))";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="phish-mono text-[11px] uppercase text-[hsl(var(--foreground-subtle))]">
          {label}
        </span>
        <span className="phish-mono text-[11px] text-[hsl(var(--foreground-muted))]">
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 border border-border bg-[hsl(var(--background))]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="h-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function Pipeline() {
  return (
    <div className="phish-map border border-border p-3 md:p-6">
      <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
        <svg
          viewBox="0 0 1000 520"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <filter id="phish-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            id="phish-main-path"
            className="phish-map-path phish-map-path-live"
            d="M112 98 C172 64 242 64 302 98 S432 132 492 98 S622 64 682 98 C768 145 866 182 834 260 C806 326 748 360 684 404"
          />
          <path
            id="phish-local-path"
            className="phish-map-path phish-map-path-branch"
            d="M648 414 C610 410 562 410 506 410"
          />
          <path
            id="phish-llm-path"
            className="phish-map-path phish-map-path-branch"
            d="M650 434 C560 480 420 472 310 422"
          />
          <path
            id="phish-return-path"
            className="phish-map-path phish-map-path-live"
            d="M462 410 C352 410 250 410 122 410"
          />
          <path
            className="phish-map-path phish-map-path-faint"
            d="M312 425 C248 392 174 392 112 410"
          />
          <circle r="5" className="phish-map-packet" filter="url(#phish-glow)">
            <animateMotion dur="7s" repeatCount="indefinite">
              <mpath href="#phish-main-path" />
            </animateMotion>
          </circle>
          <circle r="4" className="phish-map-packet phish-map-packet-alt">
            <animateMotion dur="4.8s" repeatCount="indefinite" begin="1.2s">
              <mpath href="#phish-local-path" />
            </animateMotion>
          </circle>
          <circle r="4" className="phish-map-packet phish-map-packet-alt">
            <animateMotion dur="5.4s" repeatCount="indefinite" begin="2s">
              <mpath href="#phish-llm-path" />
            </animateMotion>
          </circle>
          <circle r="5" className="phish-map-packet" filter="url(#phish-glow)">
            <animateMotion dur="5.8s" repeatCount="indefinite" begin="2.6s">
              <mpath href="#phish-return-path" />
            </animateMotion>
          </circle>
        </svg>

        {FLOW.map(({ Icon, id, label, detail, x, y }, index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.55, delay: index * 0.04, ease: EASE }}
            className="phish-map-node group absolute w-[170px] border border-border bg-card/95 p-4 shadow-[0_24px_60px_-44px_rgba(0,0,0,0.9)] backdrop-blur"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="flex items-center justify-between gap-3">
              <Icon
                className="h-5 w-5 text-[hsl(var(--gold))]"
                strokeWidth={1.6}
              />
              <span className="phish-mono text-[10px] text-[hsl(var(--foreground-subtle))]">
                0{index + 1}
              </span>
            </div>
            <h3 className="mt-5 text-sm font-semibold text-foreground">
              {label}
            </h3>
            <p className="mt-2 text-[12px] leading-snug text-[hsl(var(--foreground-soft))]">
              {detail}
            </p>
            {id === "router" && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["local", "roberta", "openai"].map((chip) => (
                  <span
                    key={chip}
                    className="phish-mono border border-border px-1.5 py-0.5 text-[9px] text-[hsl(var(--foreground-subtle))]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        <div className="phish-runtime-trace absolute bottom-8 right-8 hidden w-[210px] border border-border bg-[hsl(var(--background))]/80 p-4 backdrop-blur xl:block">
          <p className="phish-mono text-[10px] uppercase text-[hsl(var(--gold))]">
            Runtime trace
          </p>
          <div className="mt-3 space-y-2 text-[12px] leading-snug text-[hsl(var(--foreground-soft))]">
            <p>selectedModel: local</p>
            <p>email_text: normalized body</p>
            <p>prediction: Legitimate Email</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {FLOW.map(({ Icon, id, label, detail }, index) => (
          <div key={id} className="flex gap-3 border border-border bg-card p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-[hsl(var(--gold))]">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="phish-mono text-[10px] text-[hsl(var(--foreground-subtle))]">
                  0{index + 1}
                </span>
                <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-[hsl(var(--foreground-soft))]">
                {detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhishTechStack() {
  return (
    <div className="phish-tech-strip flex max-w-full overflow-x-auto pb-6 pl-2 pt-10">
      {TECH.map((tech) => (
        <div
          key={tech.name}
          className="group relative -ml-3 shrink-0 transition-[z-index] duration-0 first:ml-0 hover:z-30"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-border bg-card text-foreground/70 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out group-hover:-translate-y-2.5 group-hover:border-[hsl(var(--gold))]/50 group-hover:text-[hsl(var(--gold))] group-hover:shadow-[0_16px_30px_-12px_rgba(0,0,0,0.65)]">
            <svg
              viewBox="0 0 24 24"
              width={24}
              height={24}
              fill="currentColor"
              aria-hidden
            >
              <path d={tech.path} />
            </svg>
          </div>
          <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-2.5 flex translate-y-1 items-center gap-2 whitespace-nowrap rounded-full bg-foreground py-1.5 pl-4 pr-1.5 text-background opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="text-xs font-semibold">{tech.name}</span>
            <span className="rounded-full bg-background/15 px-2 py-0.5 text-[10px] tracking-wide text-background/70">
              {tech.tag}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
