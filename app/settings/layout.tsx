import Header from "@/components/Header/Header";

export const metadata = {
  title: "Настройки профиля | Poetry",
  description: "Управляйте своей учетной записью",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
