"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/LogoMark";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      let email = username.trim();
      if (!email.includes("@")) {
        email = `${email}@donsocialbar.com`;
      }
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <div className="login">
      <LogoMark size={88} className="emblem" bg="var(--surface)" />
      <h1>Panel de administración</h1>
      <p className="sub">Ingresá para editar la carta</p>

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            className="input"
            type="text"
            autoComplete="username"
            placeholder="DonSocialBar"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="err">{error}</p>}
        <button className="btn-primary" type="submit" disabled={pending}>
          {pending ? "Ingresando…" : "Ingresar al panel"}
        </button>
      </form>

      <p className="note">¿Problemas para entrar? Contactá al desarrollador.</p>
    </div>
  );
}
