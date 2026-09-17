"use client";

import { useActionState } from "react";
import { login } from "../actions/auth";
import { SubmitButton } from "./submit-button";

export default function LoginPage() {
  const [state, formAction] = useActionState(login, {});

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        action={formAction}
        className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Please enter your details</p>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email Address"
            required
            aria-label="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            required
            aria-label="password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <SubmitButton />

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </a>
        </p>

        {state.error && (
          <p className="text-center text-sm text-red-600">{state.error}</p>
        )}

        {state.message && (
          <p className="text-center text-sm text-gray-600">{state.message}</p>
        )}
      </form>
    </main>
  );
}
