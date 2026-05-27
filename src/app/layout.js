import "./globals.css";

export const metadata = {
  title: "Anime Silhouette Generator",
  description: "Turn any prompt into a silhouette animation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-300 min-h-screen">
        {children}
      </body>
    </html>
  );
}
