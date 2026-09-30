import { Badge } from "@/components/ui/badge";
import { statusLabel, type OJTStatus } from "@/lib/calculations/progress";

const TONE: Record<OJTStatus, "muted" | "accent" | "success"> = {
  "not-started": "muted",
  "in-progress": "accent",
  "almost-complete": "accent",
  completed: "success",
};

export function StatusBadge({ status }: { status: OJTStatus }) {
  return <Badge tone={TONE[status]}>{statusLabel(status)}</Badge>;
}
