import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono"
});

export const SpeedInsightsAnalytics = () => (
  <>
    <SpeedInsights />
    <Analytics />
  </>
);

export const metadata: Metadata = {
  title: "Karmastat - Statistical Calculators for Medical Research",
  description: "A comprehensive suite of statistical calculators for medical research, including sample size calculations, survival analysis, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            {children}
            <SpeedInsightsAnalytics />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
