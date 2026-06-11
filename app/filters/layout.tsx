import Header from '@/components/Header/Header'

export const metadata = {
  title: 'Фильтры | Poetry',
  description: 'Фильтры творов по авторам, темам и параметрам',
}

export default function FiltersLayout({
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

