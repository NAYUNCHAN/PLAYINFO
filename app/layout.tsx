import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Race Note",
  description: "한국 KRA 공공데이터와 일본 JRA 공식 링크를 정리하는 개인 홈페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
