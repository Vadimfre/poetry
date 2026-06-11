import { AssignmentPlayer } from "@/src/features/assignment";

export default function StudentAssignmentResultPage({
  params,
}: {
  params: { assignmentId: string };
}) {
  return <AssignmentPlayer assignmentId={params.assignmentId} />;
}
