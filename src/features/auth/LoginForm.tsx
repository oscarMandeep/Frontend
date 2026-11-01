"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Field } from "@/components/auth/Field";
import { PasswordField } from "@/components/auth/PasswordField";
import { GradientButton } from "@/components/brand/GradientButton";
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api/fetcher";
import { login } from "@/lib/api/generated/auth/auth";
import { getMe } from "@/lib/api/generated/me/me";
import { loginSchema, type LoginValues } from "./schema";

export function messageFor(err: unknown): string {
  if (isApiError(err)) {
    if (err.error.code === "INVALID_CREDENTIALS")
      return "Wrong email or password.";
    if (err.error.code === "RATE_LIMITED")
      return "Too many attempts. Wait a minute and try again.";
    if (err.error.code === "EMAIL_TAKEN")
      return "An account with this email already exists. Log in instead.";
    return err.error.message;
  }
  return "Could not reach the server. Check your connection and try again.";
}

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await login(values);
      const me = (await getMe()).data;
      router.push(me.onboarded ? "/discover" : "/onboarding");
    } catch (err) {
      setFormError(messageFor(err));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      <Field id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="h-12 rounded-full px-4 text-base"
          {...register("email")}
        />
      </Field>
      <Field id="password" label="Password" error={errors.password?.message}>
        <PasswordField
          id="password"
          autoComplete="current-password"
          placeholder="Your password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
      </Field>

      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
        >
          {formError}
        </p>
      )}

      <GradientButton
        type="submit"
        disabled={isSubmitting}
        className="h-14 w-full text-base"
      >
        {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : "Log in"}
      </GradientButton>
    </form>
  );
}
