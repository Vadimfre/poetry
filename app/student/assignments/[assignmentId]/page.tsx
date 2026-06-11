import { AssignmentPlayer } from "@/src/features/assignment";

export default function StudentAssignmentPage({
  params,
}: {
  params: { assignmentId: string };
}) {
  return <AssignmentPlayer assignmentId={params.assignmentId} />;
}
