# weavetta

> Your workflows, your keys, your laptop. You see the cost before you click run.

A drag-and-drop visual builder for AI content workflows — made for marketers, not
engineers. Open a URL, drag nodes onto a canvas, connect them, paste your own LLM
key, and run. No install. No account. No backend.

## Why

Every visual AI workflow tool makes you pay before you understand what you'll
spend — credits burn on a test run, and there's no way back. weavetta flips it:

- **See the cost before you run.** A live USD estimate sits next to the Run
  button and updates as you edit. No credit math, no surprises.
- **Bring your own key.** Your OpenAI / Anthropic / OpenRouter key lives in your
  browser (IndexedDB) and calls go straight from your laptop to the provider.
  The key never touches our servers — there are no servers.
- **Never lose work.** Diff-based undo across the whole canvas, capped locally so
  it can't blow up your browser storage.
- **Watch it think.** LLM output streams onto the canvas as it generates, and
  every node shows its last input, last output, and last error inline.

## Stack

Next.js · React Flow (`@xyflow/react`) · Tailwind + shadcn/ui · IndexedDB via
`idb` · zustand. Deployed static to Vercel — anyone with the URL is working in
seconds.

## Status

**v0.0 — scaffold.** Empty canvas with one demo node, the cost-preview header
(placeholder `$0.00`), and the IndexedDB + pricing scaffolding wired but inert.
v0.1 ships the seven node types, the live cost estimate, streaming output,
diff-based undo, per-node debug, and five starter templates.

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

## License

MIT. See [LICENSE](LICENSE).
