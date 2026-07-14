import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { SocketProvider } from "./context/socketContext";
import { getAuthTokenServer } from "./Middleware/AccessToken";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { GachaSocketListener } from "./components/GachaSocketListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gacha Admin - System Control",
  description:
    "Manage global item pool, manipulate rarity weights, and monitor drop rate equilibrium.",
};

// export default async function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   // Filter: block the protected app until a token cookie exists
//   const cookieStore = await cookies(); // drop the `await` if you're on Next <15
//   const token = cookieStore.get("token")?.value;

//   return (
//     <html
//       lang="en"
//       className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
//     >
//       <body className="min-h-full flex flex-col" suppressHydrationWarning>
//         {/* <SocketProvider>{token ? children : <FormLogin />}</SocketProvider> */}
//         <SocketProvider>{children}</SocketProvider>
//       </body>
//     </html>
//   );
// }
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const token = cookieStore.get("token")?.value ?? null;
  const token = (await getAuthTokenServer()) ?? null;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <UserProvider>
          <AuthProvider token={token}>
            <SocketProvider token={token}>
              <GachaSocketListener />
              {children}
            </SocketProvider>
          </AuthProvider>
        </UserProvider>
      </body>
    </html>
  );
}