/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Assistant from "./pages/Assistant";
import DiseaseDetection from "./pages/DiseaseDetection";
import MarketPrices from "./pages/MarketPrices";
import Weather from "./pages/Weather";
import LoanEligibility from "./pages/LoanEligibility";
import IntelligenceHub from "./pages/IntelligenceHub";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="intelligence" element={<IntelligenceHub />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="disease" element={<DiseaseDetection />} />
          <Route path="market" element={<MarketPrices />} />
          <Route path="weather" element={<Weather />} />
          <Route path="loan" element={<LoanEligibility />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
