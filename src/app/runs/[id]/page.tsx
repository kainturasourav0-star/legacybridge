import { RunConsole } from '@/features/runs/RunConsole';

export default function SingleRunPage({ params }: { params: { id: string } }) {
  return <RunConsole runId={params.id} />;
}
