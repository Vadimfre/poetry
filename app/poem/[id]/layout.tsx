import Header from '@/components/Header/Header'

export default function PoemLayout({
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

