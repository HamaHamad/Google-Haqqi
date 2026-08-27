/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import RightsCalculator from "./pages/RightsCalculator";
import Workflow from "./pages/Workflow";
import Complaints from "./pages/Complaints";
import Stories from "./pages/Stories";
import AiIntake from "./pages/AiIntake";
import DraftingMode from "./pages/DraftingMode";
import EvidenceOrganizer from "./pages/EvidenceOrganizer";
import Precedents from "./pages/Precedents";
import CaseEvaluation from "./pages/CaseEvaluation";
import CostsEstimator from "./pages/CostsEstimator";
import Directory from "./pages/Directory";
import SharedCase from "./pages/SharedCase";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Shared dossier viewer lives outside the main layout (read-only) */}
          <Route path="/shared/:token" element={<SharedCase />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="calculator" element={<RightsCalculator />} />
            <Route path="costs-estimator" element={<CostsEstimator />} />
            <Route path="workflow" element={<Workflow />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="stories" element={<Stories />} />
            <Route path="ai-intake" element={<AiIntake />} />
            <Route path="drafting" element={<DraftingMode />} />
            <Route path="evidence" element={<EvidenceOrganizer />} />
            <Route path="precedents" element={<Precedents />} />
            <Route path="evaluation" element={<CaseEvaluation />} />
            <Route path="directory" element={<Directory />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
