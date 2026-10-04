import "./globals.css";
import Navigation from "./ui/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <Navigation />

        <main className="ml-64 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
