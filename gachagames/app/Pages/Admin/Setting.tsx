"use client";

import React, { useState } from "react";
import { ShieldUser, AtSign, Lock, Zap, Eye, EyeOff } from "lucide-react";
import { baseUrl, sendRequest } from "@/app/static/core_function";

export default function AdminRegisterForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "ADMINISTRATOR",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError("Username, email, and password are all required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await sendRequest(
        `${baseUrl}/authentication/register`,
        "POST",
        form,
      );
      const res = response as any;
      if (!res.result) throw new Error("Registration failed");

      setSuccess(true);
      setForm({ username: "", email: "", password: "", role: "ADMIN" });
    } catch (err) {
      try {
        const failed = JSON.parse((err as any).message);
        setError(failed.error || "Registration failed");
      } catch {
        setError(err instanceof Error ? err.message : "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-panel border border-border-custom shadow-lg max-w-xl space-y-6">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">
          Register New Administrator
        </span>
        <span className="text-xs text-muted">
          Create a new admin account with system access privileges.
        </span>
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg font-mono">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-xs bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-lg font-mono">
          ✅ Administrator account created successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 border-t border-border-custom/30 pt-6">
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">
            Username
          </label>
          <div className="relative">
            <ShieldUser
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={form.username}
              onChange={handleChange("username")}
              type="text"
              placeholder="admin_username"
              className="w-full bg-[#13110e] text-foreground border border-border-custom/50 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <AtSign
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={form.email}
              onChange={handleChange("email")}
              type="email"
              placeholder="admin@yourdomain.com"
              className="w-full bg-[#13110e] text-foreground border border-border-custom/50 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={form.password}
              onChange={handleChange("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full bg-[#13110e] text-foreground border border-border-custom/50 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-mono"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span className="text-[10px] text-muted/70 font-mono">Minimum 8 characters</span>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="group w-full relative overflow-hidden bg-gold hover:bg-gold-hover text-black py-3.5 px-6 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,208,43,0.3)] active:scale-[0.98] select-none text-sm border border-gold/10 disabled:opacity-60 disabled:hover:shadow-none disabled:active:scale-100"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? "Creating Account..." : "Create Administrator"}
              <Zap size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}