import {
  Type,
  Sparkles,
  Scissors,
  Repeat,
  Braces,
  Eye,
  Download,
  type LucideIcon,
} from "lucide-react";
import type { NodeKind } from "./types";

export interface NodeMeta {
  kind: NodeKind;
  label: string;
  blurb: string;
  icon: LucideIcon;
  accent: string; // tailwind text color for the icon
  hasInput: boolean; // renders a target handle
  hasOutput: boolean; // renders a source handle
}

// Single source of truth for the seven node kinds — palette, canvas card, and
// (later) the runner all read from here.
export const NODE_REGISTRY: Record<NodeKind, NodeMeta> = {
  input: {
    kind: "input",
    label: "Input",
    blurb: "Paste text or drop a file",
    icon: Type,
    accent: "text-sky-500",
    hasInput: false,
    hasOutput: true,
  },
  llm: {
    kind: "llm",
    label: "LLM Call",
    blurb: "Prompt a model with {{input}}",
    icon: Sparkles,
    accent: "text-violet-500",
    hasInput: true,
    hasOutput: true,
  },
  split: {
    kind: "split",
    label: "Split",
    blurb: "Break text into chunks",
    icon: Scissors,
    accent: "text-amber-500",
    hasInput: true,
    hasOutput: true,
  },
  loop: {
    kind: "loop",
    label: "Loop",
    blurb: "Iterate over a list",
    icon: Repeat,
    accent: "text-emerald-500",
    hasInput: true,
    hasOutput: true,
  },
  format: {
    kind: "format",
    label: "Format",
    blurb: "Apply a template to outputs",
    icon: Braces,
    accent: "text-rose-500",
    hasInput: true,
    hasOutput: true,
  },
  preview: {
    kind: "preview",
    label: "Preview",
    blurb: "Show output on the canvas",
    icon: Eye,
    accent: "text-cyan-500",
    hasInput: true,
    hasOutput: true,
  },
  export: {
    kind: "export",
    label: "Export",
    blurb: "Copy or download the result",
    icon: Download,
    accent: "text-indigo-500",
    hasInput: true,
    hasOutput: false,
  },
};

export const NODE_KINDS = Object.keys(NODE_REGISTRY) as NodeKind[];
