import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "dawn — 새벽의 기록",
  description: "밤에 쓰고 아침에 열리는 익명 기록 공간",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full dark`}>
      <head>
        {/* 테마 플래시 방지: 렌더 전 KST 시간 기반으로 즉시 적용 */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var hour = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Seoul'})).getHours();
              var theme;
              if(hour>=0&&hour<5) theme='dark';
              else if(hour>=5&&hour<21) theme='light';
              else theme=localStorage.getItem('dawn-theme')||'dark';
              if(theme==='light') document.documentElement.classList.remove('dark');
              else document.documentElement.classList.add('dark');
            }catch(e){}
          })();
        `}} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
