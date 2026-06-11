import Header from '@/components/Header/Header'

export const metadata = {
  title: 'Квізы | Poetry',
}

export default function QuizzesLayout({
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
