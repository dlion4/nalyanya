/* ── LEGAL routes ────────────────────────────────────────────────────────── */

import { Route } from "react-router-dom";
import StubPage from "../pages/home/StubPage";
import { LEGAL_PATHS } from "./paths";

export const legalRoutes = (
  <>
    <Route path={LEGAL_PATHS.privacy} element={<StubPage title="Privacy" blurb="Public pages show roles, shortened names and county-level places only. Everything personal stays behind family sign-in." />} />
    <Route path={LEGAL_PATHS.terms} element={<StubPage title="Terms" blurb="Family terms — usage, responsibility and honesty about simulated features." />} />
  </>
);
