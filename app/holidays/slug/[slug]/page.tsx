"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/shared/api/client";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import { useI18n } from "@/src/shared/i18n";
import Header from "@/components/Header/Header";

export default function HolidayPage() {
  const { t } = useI18n();
  const params = useParams();
  const slug = params.slug as string;
  const holidayQueryKey = useLocaleQueryKey(["holiday", slug]);

  const { data: holiday, isLoading } = useQuery({
    queryKey: holidayQueryKey,
    queryFn: () => apiClient.get(`/holidays/${slug}`).then((res) => res.data),
  });

  if (isLoading) {
    return <div>{t("holiday.loading")}</div>;
  }

  if (!holiday) {
    return <div>{t("holiday.notFound")}</div>;
  }

  return (
    <>
      <Header />
      <div style={{ padding: "2rem" }}>
        <h1>{holiday.title}</h1>
        <p>{holiday.description}</p>
      </div>
    </>
  );
}
