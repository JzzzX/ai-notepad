import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Notepad - 智能会议笔记",
  description: "类 Granola 的 AI 会议记录工具，面向中国市场。实时转写、说话人分离、AI 融合笔记。",
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
