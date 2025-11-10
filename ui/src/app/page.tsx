"use client";

import PredictionForm from "./PredictionForm";
import PredictionHistory from "./PredictionHistory";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">
        <div className="w-full">
          <PredictionForm />
        </div>
        <div className="w-full h-120 overflow-scroll">
          <PredictionHistory />
        </div>
      </div>
    </main>
  );
}