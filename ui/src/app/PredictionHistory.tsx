import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, CalendarClock, DollarSign, Scaling } from "lucide-react";

interface PredictionHistoryEntry {
  id: string;
  createdAt: string;
  modelVersion: string;
  sqft: number;
  bedrooms: number;
  price: number;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function PredictionHistory() {
  const { data, isLoading, isError, refetch } = useQuery<PredictionHistoryEntry[]>({
    queryKey: ["predictions"],
    queryFn: async () => {
      const res = await fetch("/api/predictions");
      if (!res.ok) {
        throw new Error(`Failed to fetch predictions (${res.status})`);
      }
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  const content = useMemo(() => {
    if (isLoading) {
      return <p className="text-sm text-muted-foreground">Loading history…</p>;
    }

    if (isError) {
      return (
        <div className="space-y-2 text-sm text-destructive">
          <p>Unable to load prediction history.</p>
          <button
            className="rounded bg-destructive px-3 py-1 text-xs font-medium text-white"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return <p className="text-sm text-muted-foreground">No predictions yet. Submit the form to get started.</p>;
    }

    return (
      <ul className="flex flex-1 flex-col gap-4 overflow-y-auto pr-2">
        {data.map((prediction) => (
          <li
            key={prediction.id}
            className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                {new Date(prediction.createdAt).toLocaleString()}
              </span>
              <span className="font-medium text-slate-500">{prediction.modelVersion}</span>
            </div>

            <div className="flex flex-col gap-2 text-sm text-slate-700">
              <span className="flex items-center gap-2">
                <Scaling className="h-4 w-4 text-slate-500" />
                <strong className="text-slate-900">{prediction.sqft.toLocaleString()}</strong>
                <span className="text-slate-500">sqft</span>
              </span>
              <span className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-slate-500" />
                <strong className="text-slate-900">{prediction.bedrooms}</strong>
                <span className="text-slate-500">bedrooms</span>
              </span>
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <strong className="text-emerald-600">{currency.format(prediction.price)}</strong>
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  }, [data, isError, isLoading, refetch]);

  return (
    <section className="flex h-full min-h-[22rem] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Prediction History</h2>
        <p className="text-sm text-muted-foreground">Latest predictions appear first.</p>
      </header>
      {content}
    </section>
  );
}