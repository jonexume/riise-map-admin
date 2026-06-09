import { ImpactReport } from "@/components/impact-report/ImpactReport";

export default function Impact() {
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Impact & Reporting</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Evidence-based outcomes for funders, leadership, and community partners</p>
      </div>

      <ImpactReport />
    </div>
  );
}
