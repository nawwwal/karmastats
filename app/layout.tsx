import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Suspense } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { LayoutWrapper } from "@/components/layout/layout"

const SpeedInsightsAnalytics = () => (
  <>
    <SpeedInsights />
    <Analytics />
  </>
)

export const metadata: Metadata = {
  title: "Karmastat - Statistical Analysis Platform",
  description: "Advanced statistical analysis tools for research and development",
  keywords: "statistics, analysis, research, data, biostatistics, epidemiology",
  authors: [{ name: "Karmastat Team" }],
  openGraph: {
    title: "Karmastat - Statistical Analysis Platform",
    description: "Advanced statistical analysis tools for research and development",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Suspense>
          <SpeedInsightsAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
