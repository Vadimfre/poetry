"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/shared/api/client";
import Header from "@/components/Header/Header";

export default function HolidayPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: holiday, isLoading } = useQuery({
    queryKey: ["holiday", slug],
    queryFn: () => apiClient.get(`/holidays/${slug}`).then((res) => res.data),
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!holiday) {
    return <div>Праздник не найден</div>;
  }

  return (
    <>
      <Header />
      <div style={{ padding: "2rem" }}>
        <h1>{holiday.title}</h1>
        <p>{holiday.description}</p>
        {/* Дополнительный контент */}
      </div>
    </>
  );
}
