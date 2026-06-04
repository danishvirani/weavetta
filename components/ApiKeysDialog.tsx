"use client";

import { useEffect, useState } from "react";
import { KeyRound, Check, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiKeys } from "@/lib/api-keys";
import { PROVIDERS } from "@/lib/llm";
import type { LLMProvider } from "@/lib/types";

function KeyRow({ provider, label }: { provider: LLMProvider; label: string }) {
  const saved = useApiKeys((s) => Boolean(s.keys[provider]));
  const setKey = useApiKeys((s) => s.setKey);
  const removeKey = useApiKeys((s) => s.removeKey);
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        {saved && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
            <Check className="size-3" /> saved
          </span>
        )}
      </div>
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Input
            type={show ? "text" : "password"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={saved ? "•••••••• — paste to replace" : `Paste your ${label} key`}
            className="pr-8 font-mono text-xs"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={show ? "Hide key" : "Show key"}
          >
            {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
        </div>
        <Button
          size="sm"
          disabled={!draft.trim()}
          onClick={() => {
            void setKey(provider, draft);
            setDraft("");
          }}
        >
          Save
        </Button>
        {saved && (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Remove ${label} key`}
            onClick={() => {
              void removeKey(provider);
              setDraft("");
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function ApiKeysDialog() {
  const load = useApiKeys((s) => s.load);
  const count = useApiKeys((s) => Object.keys(s.keys).length);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <KeyRound className="size-3.5" />
            Keys
            {count > 0 && (
              <span className="ml-0.5 rounded-full bg-emerald-500/15 px-1.5 text-[11px] font-medium text-emerald-600">
                {count}
              </span>
            )}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your API keys</DialogTitle>
          <DialogDescription>
            Stored in this browser only (IndexedDB). Calls go straight from your
            laptop to the provider — your key never touches our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {PROVIDERS.map((p) => (
            <KeyRow key={p.value} provider={p.value} label={p.label} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
