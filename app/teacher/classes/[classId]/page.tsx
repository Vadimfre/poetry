import { TeacherWorkspace } from "@/src/features/assignment";

export default function TeacherClassPage({
  params,
}: {
  params: { classId: string };
}) {
  return <TeacherWorkspace initialClassId={params.classId} />;
}
