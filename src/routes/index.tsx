/* ── Route tree — composed from category groups ────────────────────────────
   home.routes.tsx   → H-1 landing, H-2 about (built) + designed stubs
   auth.routes.tsx   → sign in / join (stubs until the auth series)
   legal.routes.tsx  → privacy / terms
   Scroll resets to top on every route change.                           */

import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import StubPage from "../pages/home/StubPage";
import { homeRoutes } from "./home.routes";
import { authRoutes } from "./auth.routes";
import { legalRoutes } from "./legal.routes";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [pathname]);
  return null;
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {homeRoutes}
        {authRoutes}
        {legalRoutes}
        <Route path="*" element={<StubPage title="Not found" blurb="That page doesn't exist yet. Start at the landing page and walk the tree from the root." />} />
      </Routes>
    </>
  );
}
