import { lazy } from "react";

// Lazy load authentication components
const SignIn = lazy(() => import("layouts/authentication/sign-in"));
const SignUp = lazy(() => import("layouts/authentication/sign-up"));
const ResetPassword = lazy(() => import("layouts/authentication/reset-password/cover"));

/**
 * Authentication routes configuration
 * These routes are publicly accessible (no role requirements)
 */
export const authRoutes = [
  {
    key: "sign-in",
    path: "auth/sign-in",
    element: <SignIn />,
    meta: {
      title: "Sign In",
      description: "Sign in to your account",
    },
  },
  {
    key: "sign-up",
    path: "auth/sign-up",
    element: <SignUp />,
    meta: {
      title: "Sign Up",
      description: "Create a new account",
    },
  },
  {
    key: "reset-password",
    path: "auth/reset-password",
    element: <ResetPassword />,
    meta: {
      title: "Reset Password",
      description: "Reset your password",
    },
  },
];