import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ogUrl from "@/public/OG_image.png";
import { SITE_URL } from "@/lib/site";
import { CookiesProvider } from "next-client-cookies/server";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "모여라",
  description: "AI 팀 싱크를 사용하여 팀 일정을 조율해보세요.",
  openGraph: {
    title: "모여라",
    description: "가볍고 빠르게 팀 싱크를 이용해보세요!",
    url: `${SITE_URL}/`,
    siteName: "모여라",
    images: [
      {
        url: ogUrl.src, // ⭐️ 중요: 반드시 도메인이 포함된 절대 경로!
        width: 1200,
        height: 630,
        alt: "서비스 미리보기 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="b4gVRX-jdjyjK0gN2XDlxw85xMN2QdBvdiaqvF7rAqA"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <CookiesProvider>{children}</CookiesProvider>
      </body>
    </html>
  );
}
