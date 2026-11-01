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
import { register as registerAccount } from "@/lib/api/generated/auth/auth";
import { messageFor } from "./LoginForm";
import { registerSchema, type RegisterValues } from "./schema";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      await registerAccount(values);
      router.push("/onboarding"); // a new account always starts with onboarding
    } catch (err) {
      if (isApiError(err) && err.error.code === "EMAIL_TAKEN") {
        setError("email", {
          message: "An account with this email already exists.",
        });
      } else {
        setFormError(messageFor(err));
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      <Field id="name" label="Your name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Aarav Sharma"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="h-12 rounded-full px-4 text-base"
          {...register("name")}
        />
      </Field>
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
        {isSubmitting ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          "Create account"
        )}
      </GradientButton>
    </form>
  );
}
