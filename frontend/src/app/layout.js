"use client"

import "./globals.css";
import Topbar from "./TopBar";
import { AuthProvider } from './context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-100">
        <AuthProvider>
          <Topbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
