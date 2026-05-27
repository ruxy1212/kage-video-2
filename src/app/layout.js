export const metadata = {
  title: "Anime Silhouette Generator",
  description: "Turn any prompt into a silhouette animation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a14", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
