import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "여명 — 새벽의 기록",
  description: "밤에 쓰고 아침에 열리는 익명 기록 공간",
};

// 플래시 방지: 렌더 전 KST 시간 기반으로 CSS 변수 즉시 적용
const noFlashScript = `
(function(){
  try {
    var L={bg:[250,248,244],fg1:[41,37,36],fg2:[87,83,78],fg3:[120,113,108],fg4:[168,162,158],fg5:[214,211,209],border:[231,229,228],card:[245,245,244],hover:[231,229,228],input:[255,255,255]};
    var D={bg:[7,7,14],fg1:[193,193,195],fg2:[168,168,170],fg3:[131,131,133],fg4:[94,94,96],fg5:[69,69,71],border:[27,27,29],card:[15,15,16],hover:[19,19,21],input:[13,13,16]};
    var kst=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Seoul'}));
    var h=kst.getHours(),s=kst.getMinutes()*60+kst.getSeconds(),t;
    if(h>=0&&h<5)t=1;
    else if(h===5)t=Math.max(0,1-s/3600);
    else if(h>=6&&h<21)t=0;
    else t=Math.min(1,((h-21)*3600+s)/(3*3600));
    var el=document.documentElement;
    Object.keys(L).forEach(function(k){
      var a=L[k],b=D[k];
      var r=Math.round(a[0]+(b[0]-a[0])*t),g=Math.round(a[1]+(b[1]-a[1])*t),bv=Math.round(a[2]+(b[2]-a[2])*t);
      el.style.setProperty('--c-'+k,r+' '+g+' '+bv);
    });
  }catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
