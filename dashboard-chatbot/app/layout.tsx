// app/layout.tsx
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-100 text-zinc-900">
        {children}
      </body>
    </html>
  )
}