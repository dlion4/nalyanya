/* ── AUTH & ONBOARDING routes (A-1 … A-8) ────────────────────────────────────
   Every route renders a real auth-format screen inside the shared AuthShell —
   heritage pinhole reel left, one focused job right. Aliases: /join → A-1,
   /signin → A-2. Every page owns its TSX + data + stylesheet.              */

import { Route } from "react-router-dom";
import SignUp from "../pages/auth/SignUp";
import SignIn from "../pages/auth/SignIn";
import Onboard from "../pages/auth/Onboard";
import CreateFamily from "../pages/auth/CreateFamily";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import TwoFA from "../pages/auth/TwoFA";
import { AUTH_PATHS } from "./paths";

export const authRoutes = (
  <>
    {/* A-1 — Sign Up */}
    <Route path={AUTH_PATHS.signup} element={<SignUp />} />
    <Route path={AUTH_PATHS.join} element={<SignUp />} />

    {/* A-2 — Sign In */}
    <Route path={AUTH_PATHS.signin} element={<SignIn />} />
    <Route path={AUTH_PATHS.signinSpecCanonical} element={<SignIn />} />

    {/* A-3 — Onboarding wizard */}
    <Route path={AUTH_PATHS.onboard} element={<Onboard />} />

    {/* A-4 — Create family / lineage */}
    <Route path={AUTH_PATHS.createFamily} element={<CreateFamily />} />

    {/* A-5 — Forgot password */}
    <Route path={AUTH_PATHS.forgot} element={<ForgotPassword />} />

    {/* A-6 — Reset password */}
    <Route path={AUTH_PATHS.reset} element={<ResetPassword />} />

    {/* A-7 — Verify OTP */}
    <Route path={AUTH_PATHS.verify} element={<VerifyOtp />} />

    {/* A-8 — 2FA + receive PIN */}
    <Route path={AUTH_PATHS.twoFA} element={<TwoFA />} />
  </>
);
