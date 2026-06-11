import { StudentWorkspace } from "@/src/features/assignment";

export default function StudentClassPage({
  params,
}: {
  params: { classId: string };
}) {
  return <StudentWorkspace classId={params.classId} />;
}
