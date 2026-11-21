/* ── HOME routes (H-1 … H-7) ─────────────────────────────────────────────── */

import { Route } from "react-router-dom";
import Landing from "../pages/home/Landing";
import About from "../pages/home/About";
import Professions from "../pages/home/Professions";
import Contact from "../pages/home/Contact";
import StubPage from "../pages/home/StubPage";
import { HOME_PATHS } from "./paths";

export const homeRoutes = (
  <>
    <Route path={HOME_PATHS.landing} element={<Landing />} />
    <Route path={HOME_PATHS.about} element={<About />} />
    <Route path={HOME_PATHS.professions} element={<Professions />} />
    <Route path={HOME_PATHS.foundation} element={<StubPage title="Nalyanya Foundation" blurb="The family charity arm — education, medical and emergency causes, public and auditable." />} />
    <Route path={HOME_PATHS.events} element={<StubPage title="Events & reunions" blurb="The family calendar — weddings, reunions, harambees and funerals, with RSVPs and photo albums." />} />
    <Route path={HOME_PATHS.gallery} element={<StubPage title="Gallery" blurb="Every memory with the album and year it belongs to — lazy-loaded, filterable, shareable." />} />
    <Route path={HOME_PATHS.contact} element={<Contact />} />
  </>
);
