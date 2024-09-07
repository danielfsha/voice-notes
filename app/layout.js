import localFont from "next/font/local";
import "./globals.css";
import { DeepgramContextProvider } from "@/context/DeepgramContextProvider";
import { MicrophoneContextProvider } from "@/context/MicrophoneContextProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Voice Notes",
  description: "Take notes with your voice, no more typing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MicrophoneContextProvider>
          <DeepgramContextProvider>
            {children}
          </DeepgramContextProvider>
        </MicrophoneContextProvider>
      </body>
    </html>
  );
}
