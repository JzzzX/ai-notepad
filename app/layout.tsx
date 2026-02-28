import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "piedras - 智能会议记录",
  description: "piedras 是一个本地优先、中文优先的 AI 会议记录 Demo，支持实时转写、AI 结构化纪要、会议问答与轻量生态接入。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
