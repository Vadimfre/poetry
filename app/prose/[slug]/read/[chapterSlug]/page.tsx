"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header/Header";
import { ProseReader } from "@/components/ProseReader/ProseReader";
import { proseApi } from "@/src/shared/api/prose.api";
import { useI18n } from "@/src/shared/i18n";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";

export default function ProseReadPage({
  params,
}: {
  params: { slug: string; chapterSlug: string };
}) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignment") ?? undefined;
  const queryKey = useLocaleQueryKey([
    "prose-chapter",
    params.slug,
    params.chapterSlug,
  ]);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => proseApi.getChapter(params.slug, params.chapterSlug),
  });

  return (
    <>
      <Header />
      {isLoading && (
        <main style={{ padding: "2rem", textAlign: "center" }}>
          {t("common.loading")}
        </main>
      )}
      {error && (
        <main style={{ padding: "2rem", textAlign: "center" }}>
          {t("proseReader.notFound")}
        </main>
      )}
      {data && (
        <ProseReader data={data} readingAssignmentId={assignmentId} />
      )}
    </>
  );
}
