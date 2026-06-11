import { AssignmentResults } from "@/src/features/assignment";

export default function TeacherAssignmentResultsPage({
  params,
}: {
  params: { assignmentId: string };
}) {
  return <AssignmentResults assignmentId={params.assignmentId} />;
}
