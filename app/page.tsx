import { CostBar } from "@/components/CostBar";
import { Canvas } from "@/components/canvas/Canvas";

function HowToStrip() {
  const steps = [
    "Edit the Input on the left",
    "Check the price up top",
    "Click Run — your draft streams into Preview",
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-2">
          {i > 0 && <span className="text-muted-foreground/40">·</span>}
          <span className="flex size-4 items-center justify-center rounded-full bg-foreground/80 text-[10px] font-semibold text-background">
            {i + 1}
          </span>
          {s}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <CostBar />
      <HowToStrip />
      <div className="flex-1">
        <Canvas />
      </div>
    </main>
  );
}
