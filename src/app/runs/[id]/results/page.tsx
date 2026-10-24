import { ResultsExplorer } from '@/features/runs/ResultsExplorer';

export default function ResultsPage({ params }: { params: { id: string } }) {
  return <ResultsExplorer runId={params.id} />;
}
