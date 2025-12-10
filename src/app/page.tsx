
"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/zenit");
    }
  }, [user, router]);

  return (
    <div
      className="relative flex min-h-[calc(100vh_-_theme(spacing.8))] flex-col items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/imagenes/login-bgd.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <h1 className="mb-8 text-center font-headline text-4xl font-bold text-white md:text-5xl">
          ZENIT
        </h1>
        <div className="rounded-2xl border border-white/20 bg-card/10 p-6 shadow-2xl backdrop-blur-lg md:p-10 dark:bg-black/10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
