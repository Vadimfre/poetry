import Header from '@/components/Header/Header'

export const metadata = {
  title: 'Quizzes',
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
