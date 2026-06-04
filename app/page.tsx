import { CostBar } from "@/components/CostBar";
import { Canvas } from "@/components/canvas/Canvas";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <CostBar />
      <div className="flex-1">
        <Canvas />
      </div>
    </main>
  );
}
