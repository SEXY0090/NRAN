import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"Employee E-Verification", description:"Company employee record verification portal" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
