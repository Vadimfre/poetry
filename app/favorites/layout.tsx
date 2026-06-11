import Header from '@/components/Header/Header'

export const metadata = {
  title: 'Избранное | Poetry',
  description: 'Ваши избранные творы',
}

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}

