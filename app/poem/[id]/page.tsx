import PoemViewSection from "@/components/PoemViewSection/PoemViewSection";

interface PageProps {
  params: {
    id: string;
  };
}

export default function PoemPage({ params }: PageProps) {
  return (
    <div>
      <PoemViewSection poemId={params.id} />
    </div>
  );
}
