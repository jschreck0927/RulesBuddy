"use client";

import SupabaseProvider from "@/components/SupabaseProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserProvider, useUser } from "@/components/UserProvider";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseProvider>
      <ThemeProvider>
        <UserProvider>
          <LayoutShell>{children}</LayoutShell>
        </UserProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();

  const isAdmin = Boolean(
    profile &&
      (profile.user_type === "GROUP_ADMIN" ||
        profile.user_type === "DEPARTMENT_ADMIN" ||
        profile.user_type === "SUPER_ADMIN")
  );

  return (
    <div className="min-h-screen pb-16 flex flex-col">
      <header className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src={process.env.NEXT_PUBLIC_RULESBUDDY_LOGO_PATH || "/logo.png"}
            alt="RulesBuddy Logo"
            className="h-8 w-8"
          />
          <span className="font-semibold text-lg">RulesBuddy</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-grow container mx-auto px-4 py-4">
        {children}
      </main>

      <Navbar isAdmin={isAdmin} />
    </div>
  );
}
