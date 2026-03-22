/**
 * src/pages/AiRecommendations.tsx
 * AI-powered crop, fertilizer, yield, and price recommendation pipeline.
 * Drop this file into src/pages/ and add the route in App.tsx.
 */

import { useState } from "react";
import {
  Sprout, FlaskConical, BarChart3, TrendingUp, ChevronRight,
  Loader2, CheckCircle2, AlertTriangle, Info, MapPin, Thermometer,
  Droplets, Wind, Sun, Leaf, Zap, ArrowRight, RefreshCw, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "input" | "analyzing" | "results";

interface FarmInput {
  state: string;
  soilType: string;
  phLevel: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  rainfall: string;
  temperature: string;
  season: string;
  farmSize: string;
}

interface CropRecommendation {
  name: string;
  confidence: number;
  expectedYield: string;
  waterNeed: "low" | "medium" | "high";
  growthDays: number;
  profitability: "low" | "medium" | "high";
  mspPrice: string;
  reason: string;
}

interface FertilizerPlan {
  nutrient: string;
  product: string;
  quantity: string;
  timing: string;
  method: string;
  cost: string;
}

interface PriceForecast {
  crop: string;
  currentMSP: string;
  predicted3Month: string;
  trend: "up" | "down" | "stable";
  confidence: number;
  factors: string[];
}

interface RecommendationResult {
  crops: CropRecommendation[];
  fertilizers: FertilizerPlan[];
  priceForecast: PriceForecast[];
  yieldScore: number;
  soilHealth: number;
  riskLevel: "low" | "medium" | "high";
  actionPlan: string[];
  generatedAt: string;
}

// ─── Mock AI Response Generator ───────────────────────────────────────────────

function generateMockResults(input: FarmInput): RecommendationResult {
  const ph = parseFloat(input.phLevel) || 6.5;
  const n = parseFloat(input.nitrogen) || 50;
  const p = parseFloat(input.phosphorus) || 40;
  const k = parseFloat(input.potassium) || 60;
  const temp = parseFloat(input.temperature) || 25;
  const rain = parseFloat(input.rainfall) || 800;

  const soilHealth = Math.min(100, Math.round(
    ((ph >= 6 && ph <= 7.5 ? 30 : 15) + (n > 40 ? 25 : 12) + (p > 30 ? 25 : 12) + (k > 50 ? 20 : 10))
  ));

  const isSummer = input.season === "kharif";
  const isWinter = input.season === "rabi";

  const crops: CropRecommendation[] = isSummer ? [
    {
      name: "Soybean",
      confidence: 92,
      expectedYield: `${(input.farmSize ? parseFloat(input.farmSize) * 18 : 18).toFixed(0)} quintals`,
      waterNeed: "medium",
      growthDays: 100,
      profitability: "high",
      mspPrice: "₹4,600/q",
      reason: `Ideal for ${input.soilType || "black cotton"} soil. Your NPK levels and ${rain}mm rainfall perfectly match soybean requirements.`
    },
    {
      name: "Cotton",
      confidence: 84,
      expectedYield: `${(input.farmSize ? parseFloat(input.farmSize) * 8 : 8).toFixed(0)} quintals`,
      waterNeed: "high",
      growthDays: 160,
      profitability: "high",
      mspPrice: "₹6,620/q (medium)",
      reason: "High commercial value. Your potassium levels and temperature range are optimal for fibre development."
    },
    {
      name: "Maize",
      confidence: 78,
      expectedYield: `${(input.farmSize ? parseFloat(input.farmSize) * 32 : 32).toFixed(0)} quintals`,
      waterNeed: "medium",
      growthDays: 90,
      profitability: "medium",
      mspPrice: "₹2,225/q",
      reason: "Fast growing with steady demand. Excellent as intercrop with soybean to maximize land use."
    }
  ] : isWinter ? [
    {
      name: "Wheat",
      confidence: 94,
      expectedYield: `${(input.farmSize ? parseFloat(input.farmSize) * 35 : 35).toFixed(0)} quintals`,
      waterNeed: "medium",
      growthDays: 120,
      profitability: "high",
      mspPrice: "₹2,275/q",
      reason: `Your soil pH of ${ph} and nitrogen level of ${n} kg/ha are within the optimal range for high-yield wheat varieties.`
    },
    {
      name: "Chickpea (Chana)",
      confidence: 88,
      expectedYield: `${(input.farmSize ? parseFloat(input.farmSize) * 12 : 12).toFixed(0)} quintals`,
      waterNeed: "low",
      growthDays: 105,
      profitability: "high",
      mspPrice: "₹5,440/q",
      reason: "Fixes atmospheric nitrogen, improving soil for next season. Low water requirement suits winter irrigation capacity."
    },
    {
      name: "Mustard",
      confidence: 75,
      expectedYield: `${(input.farmSize ? parseFloat(input.farmSize) * 9 : 9).toFixed(0)} quintals`,
      waterNeed: "low",
      growthDays: 110,
      profitability: "medium",
      mspPrice: "₹5,650/q",
      reason: "Excellent oilseed option. Tolerant to your temperature range and acts as natural pest repellent for border rows."
    }
  ] : [
    {
      name: "Vegetables (Mixed)",
      confidence: 85,
      expectedYield: "Variable",
      waterNeed: "high",
      growthDays: 60,
      profitability: "high",
      mspPrice: "Market rate",
      reason: "Zaid season is ideal for short-duration vegetable crops with high market returns. Cucumber, Bitter Gourd recommended."
    },
    {
      name: "Watermelon",
      confidence: 80,
      expectedYield: `${(input.farmSize ? parseFloat(input.farmSize) * 120 : 120).toFixed(0)} quintals`,
      waterNeed: "high",
      growthDays: 75,
      profitability: "high",
      mspPrice: "Market rate",
      reason: "High demand in summer months. Sandy loam soil and warm temperatures create ideal growing conditions."
    }
  ];

  const fertilizers: FertilizerPlan[] = [
    {
      nutrient: "Nitrogen (N)",
      product: "Urea (46-0-0)",
      quantity: `${Math.round((80 - n) * 0.8)} kg/acre`,
      timing: "Split: 50% at sowing, 25% at 30 days, 25% at 45 days",
      method: "Broadcast + incorporation",
      cost: `₹${Math.round((80 - n) * 0.8 * 12)}/acre`
    },
    {
      nutrient: "Phosphorus (P)",
      product: "DAP (18-46-0)",
      quantity: `${Math.round((60 - p) * 0.6)} kg/acre`,
      timing: "Full dose at sowing (basal application)",
      method: "Band placement near root zone",
      cost: `₹${Math.round((60 - p) * 0.6 * 28)}/acre`
    },
    {
      nutrient: "Potassium (K)",
      product: "MOP (0-0-60)",
      quantity: `${Math.round((80 - k) * 0.5)} kg/acre`,
      timing: "50% at sowing, 50% at vegetative stage",
      method: "Soil incorporation before sowing",
      cost: `₹${Math.round((80 - k) * 0.5 * 18)}/acre`
    },
    {
      nutrient: "Micronutrients",
      product: "Zinc Sulphate (ZnSO₄)",
      quantity: "10 kg/acre",
      timing: "Once before sowing every 2-3 seasons",
      method: "Broadcast and mix into topsoil",
      cost: "₹350/acre"
    }
  ];

  const topCrop = crops[0];
  const priceForecast: PriceForecast[] = [
    {
      crop: topCrop.name,
      currentMSP: topCrop.mspPrice,
      predicted3Month: isSummer ? "₹4,850/q" : "₹2,380/q",
      trend: "up",
      confidence: 82,
      factors: ["Post-harvest festival demand", "Lower acreage this year", "Export demand from SE Asia", "Lower import competition"]
    },
    {
      crop: crops[1]?.name || "Wheat",
      currentMSP: crops[1]?.mspPrice || "₹2,275/q",
      predicted3Month: isSummer ? "₹6,200/q" : "₹5,580/q",
      trend: "stable",
      confidence: 74,
      factors: ["Stable government MSP", "Normal production forecast", "Procurement targets met"]
    }
  ];

  return {
    crops,
    fertilizers,
    priceForecast,
    yieldScore: Math.min(95, soilHealth + 15),
    soilHealth,
    riskLevel: soilHealth > 70 ? "low" : soilHealth > 50 ? "medium" : "high",
    actionPlan: [
      `Apply ${fertilizers[0].quantity} of Urea in split doses starting at sowing`,
      `Test soil pH again in 6 months — target range 6.0–7.0`,
      `Consider drip irrigation to optimize water use for ${topCrop.name}`,
      `Register on PM-FASAL portal for crop insurance before sowing date`,
      `Book nearest APMC mandi slot 2 weeks before expected harvest`,
      `Apply Zinc Sulphate as micronutrient correction this season`
    ],
    generatedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WaterBadge({ level }: { level: "low" | "medium" | "high" }) {
  const map = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-blue-100 text-blue-700"
  };
  return (
    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full capitalize", map[level])}>
      💧 {level}
    </span>
  );
}

function ProfitBadge({ level }: { level: "low" | "medium" | "high" }) {
  const map = {
    low: "bg-stone-100 text-stone-600",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-emerald-100 text-emerald-700"
  };
  const stars = { low: 1, medium: 2, high: 3 };
  return (
    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1", map[level])}>
      {"★".repeat(stars[level])}{"☆".repeat(3 - stars[level])} {level}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 85 ? "bg-emerald-500" : value >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-2 rounded-full transition-all duration-1000", color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-bold text-stone-700 w-10 text-right">{value}%</span>
    </div>
  );
}

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="44" cy="44" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-extrabold text-stone-800">{value}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Input Form ───────────────────────────────────────────────────────────────

const STATES = ["Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka", "Madhya Pradesh",
  "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"];
const SOIL_TYPES = ["Black Cotton (Vertisol)", "Red Laterite", "Alluvial", "Sandy Loam", "Clay Loam", "Loamy"];
const SEASONS = [
  { value: "kharif", label: "Kharif (June–October)" },
  { value: "rabi", label: "Rabi (November–April)" },
  { value: "zaid", label: "Zaid / Summer (April–June)" }
];

function InputSection({ onAnalyze }: { onAnalyze: (input: FarmInput) => void }) {
  const [form, setForm] = useState<FarmInput>({
    state: "", soilType: "", phLevel: "6.5", nitrogen: "50",
    phosphorus: "40", potassium: "60", rainfall: "800",
    temperature: "25", season: "kharif", farmSize: "5"
  });

  const set = (key: keyof FarmInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const ready = form.state && form.soilType && form.season;

  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-white rounded-[2rem] p-8 relative overflow-hidden border border-stone-700/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-5">
            <Zap className="w-3.5 h-3.5" />
            ML-Powered Pipeline
          </div>
          <h2 className="text-3xl font-bold mb-3 tracking-tight">AI Recommendation Engine</h2>
          <p className="text-stone-300 leading-relaxed font-medium">
            Enter your soil data, location, and season. Our multi-model pipeline will suggest the optimal crops,
            prescribe a fertilizer plan, predict yield, and forecast local commodity prices.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location & Context */}
        <div className="bg-white rounded-[1.5rem] border border-stone-200 shadow-sm p-7 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-800">Location & Season</h3>
          </div>

          <Field label="State / Region">
            <select value={form.state} onChange={set("state")}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800 font-medium">
              <option value="">— Select State —</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Crop Season">
            <select value={form.season} onChange={set("season")}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800 font-medium">
              {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>

          <Field label="Soil Type">
            <select value={form.soilType} onChange={set("soilType")}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800 font-medium">
              <option value="">— Select Soil Type —</option>
              {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Farm Size (acres)">
            <NumberInput value={form.farmSize} onChange={set("farmSize")} placeholder="e.g. 5" icon={<Leaf className="w-4 h-4" />} />
          </Field>
        </div>

        {/* Soil Data */}
        <div className="bg-white rounded-[1.5rem] border border-stone-200 shadow-sm p-7 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-800">Soil & Climate Data</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Soil pH">
              <NumberInput value={form.phLevel} onChange={set("phLevel")} placeholder="6.5" step="0.1" min="4" max="9" />
            </Field>
            <Field label="Nitrogen (kg/ha)">
              <NumberInput value={form.nitrogen} onChange={set("nitrogen")} placeholder="50" />
            </Field>
            <Field label="Phosphorus (kg/ha)">
              <NumberInput value={form.phosphorus} onChange={set("phosphorus")} placeholder="40" />
            </Field>
            <Field label="Potassium (kg/ha)">
              <NumberInput value={form.potassium} onChange={set("potassium")} placeholder="60" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <Field label="Annual Rainfall (mm)">
              <NumberInput value={form.rainfall} onChange={set("rainfall")} placeholder="800"
                icon={<Droplets className="w-4 h-4" />} />
            </Field>
            <Field label="Avg Temperature (°C)">
              <NumberInput value={form.temperature} onChange={set("temperature")} placeholder="25"
                icon={<Thermometer className="w-4 h-4" />} />
            </Field>
          </div>

          {/* Quick NPK visual */}
          <div className="mt-2 p-4 bg-stone-50 rounded-xl border border-stone-100">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">NPK Status</p>
            <div className="space-y-2.5">
              {[
                { label: "N", value: parseFloat(form.nitrogen) || 0, max: 100, color: "bg-emerald-500" },
                { label: "P", value: parseFloat(form.phosphorus) || 0, max: 80, color: "bg-amber-500" },
                { label: "K", value: parseFloat(form.potassium) || 0, max: 100, color: "bg-blue-500" }
              ].map(({ label, value, max, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-stone-500">{label}</span>
                  <div className="flex-1 bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div className={cn("h-2 rounded-full transition-all", color)}
                      style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
                  </div>
                  <span className="w-12 text-xs font-bold text-stone-600 text-right">{value} kg/ha</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => onAnalyze(form)}
          disabled={!ready}
          className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
        >
          <Zap className="w-6 h-6" />
          Run AI Analysis
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-stone-600">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, placeholder, icon, step, min, max }: {
  value: string; onChange: any; placeholder?: string; icon?: React.ReactNode;
  step?: string; min?: string; max?: string;
}) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">{icon}</div>}
      <input type="number" value={value} onChange={onChange} placeholder={placeholder}
        step={step} min={min} max={max}
        className={cn(
          "w-full py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800 font-medium bg-white",
          icon ? "pl-10 pr-4" : "px-4"
        )} />
    </div>
  );
}

// ─── Analyzing State ──────────────────────────────────────────────────────────

const ANALYSIS_STAGES = [
  { label: "Encoding soil features & regional data", icon: FlaskConical, delay: 0 },
  { label: "Running crop classification model", icon: Sprout, delay: 700 },
  { label: "Calculating fertilizer prescriptions", icon: BarChart3, delay: 1400 },
  { label: "Fetching APMC mandi price signals", icon: TrendingUp, delay: 2100 },
  { label: "Generating yield prediction & risk score", icon: Zap, delay: 2800 },
];

function AnalyzingState() {
  const [activeIdx, setActiveIdx] = useState(0);

  useState(() => {
    ANALYSIS_STAGES.forEach((_, i) => {
      setTimeout(() => setActiveIdx(i), ANALYSIS_STAGES[i].delay);
    });
  });

  return (
    <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-12 flex flex-col items-center text-center min-h-[500px] justify-center">
      <div className="relative mb-10">
        <div className="w-24 h-24 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-10 h-10 text-emerald-600 animate-pulse" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-stone-800 mb-2">Analyzing Your Farm Data</h3>
      <p className="text-stone-500 mb-10 font-medium">Our multi-model pipeline is processing your inputs...</p>

      <div className="w-full max-w-md space-y-3 text-left">
        {ANALYSIS_STAGES.map((stage, i) => (
          <div key={i} className={cn(
            "flex items-center gap-4 p-3.5 rounded-xl transition-all duration-500",
            i < activeIdx ? "bg-emerald-50 border border-emerald-200" :
            i === activeIdx ? "bg-stone-50 border border-stone-200 shadow-sm" :
            "opacity-30"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              i < activeIdx ? "bg-emerald-500 text-white" :
              i === activeIdx ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-400"
            )}>
              {i < activeIdx ? <CheckCircle2 className="w-4 h-4" /> : <stage.icon className="w-4 h-4" />}
            </div>
            <span className={cn(
              "text-sm font-semibold",
              i < activeIdx ? "text-emerald-700" :
              i === activeIdx ? "text-stone-800" : "text-stone-400"
            )}>
              {stage.label}
            </span>
            {i === activeIdx && <Loader2 className="w-4 h-4 text-stone-500 animate-spin ml-auto" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────

function ResultsSection({ result, onReset }: { result: RecommendationResult; onReset: () => void }) {
  const [activeTab, setActiveTab] = useState<"crops" | "fertilizer" | "price" | "plan">("crops");

  const tabs = [
    { key: "crops", label: "Crop Recommendations", icon: Sprout },
    { key: "fertilizer", label: "Fertilizer Plan", icon: FlaskConical },
    { key: "price", label: "Price Forecast", icon: TrendingUp },
    { key: "plan", label: "Action Plan", icon: CheckCircle2 },
  ] as const;

  const riskColor = { low: "text-emerald-600 bg-emerald-100", medium: "text-amber-600 bg-amber-100", high: "text-red-600 bg-red-100" };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-br from-stone-900 to-emerald-950 text-white rounded-[2rem] p-8 relative overflow-hidden border border-stone-700/40">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Analysis Complete
            </div>
            <h2 className="text-2xl font-bold mb-1">Your Personalized Farm Report</h2>
            <p className="text-stone-400 text-sm">Generated: {result.generatedAt}</p>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <ScoreRing value={result.yieldScore} label="Yield Score" color="#10b981" />
            <ScoreRing value={result.soilHealth} label="Soil Health" color="#f59e0b" />
            <div className="flex flex-col items-center gap-2">
              <div className={cn("px-4 py-2 rounded-xl text-sm font-bold capitalize", riskColor[result.riskLevel])}>
                {result.riskLevel} Risk
              </div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Farm Risk</span>
            </div>
          </div>
        </div>
        <button onClick={onReset}
          className="absolute top-6 right-6 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all",
              activeTab === tab.key
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                : "bg-white text-stone-600 border border-stone-200 hover:border-emerald-300 hover:text-emerald-700"
            )}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "crops" && (
        <div className="space-y-4">
          {result.crops.map((crop, i) => (
            <div key={i} className={cn(
              "bg-white rounded-[1.5rem] border p-6 shadow-sm transition-all hover:shadow-md",
              i === 0 ? "border-emerald-300 ring-1 ring-emerald-200" : "border-stone-200"
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold border-2",
                    i === 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-stone-50 border-stone-200 text-stone-500"
                  )}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-stone-800">{crop.name}</h3>
                      {i === 0 && <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider">Top Pick</span>}
                    </div>
                    <p className="text-stone-500 text-sm font-medium mt-0.5">Expected Yield: <span className="font-bold text-stone-700">{crop.expectedYield}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400 mb-1">MSP / Market</p>
                  <p className="font-bold text-stone-800">{crop.mspPrice}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">AI Confidence</span>
                </div>
                <ConfidenceBar value={crop.confidence} />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <WaterBadge level={crop.waterNeed} />
                <ProfitBadge level={crop.profitability} />
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  🗓 {crop.growthDays} days
                </span>
              </div>

              <p className="text-sm text-stone-600 bg-stone-50 rounded-xl p-3 border border-stone-100 leading-relaxed">
                <Info className="w-4 h-4 inline mr-1.5 text-stone-400" />
                {crop.reason}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "fertilizer" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium">
              These recommendations are based on your stated soil NPK values. For highest accuracy,
              conduct a certified soil test at your nearest Krishi Vigyan Kendra before application.
            </p>
          </div>
          {result.fertilizers.map((f, i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-lg border border-amber-200">
                    {f.nutrient.split(" ")[0][0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800">{f.nutrient}</h3>
                    <p className="text-sm text-stone-500">{f.product}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400 mb-0.5">Est. Cost</p>
                  <p className="font-bold text-emerald-700">{f.cost}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Quantity</p>
                  <p className="font-bold text-stone-800">{f.quantity}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Method</p>
                  <p className="font-bold text-stone-800 text-sm">{f.method}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Timing</p>
                  <p className="font-bold text-stone-800 text-sm">{f.timing}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "price" && (
        <div className="space-y-4">
          {result.priceForecast.map((f, i) => {
            const trendColor = f.trend === "up" ? "text-emerald-600 bg-emerald-100" : f.trend === "down" ? "text-red-600 bg-red-100" : "text-stone-600 bg-stone-100";
            const trendIcon = f.trend === "up" ? "↑" : f.trend === "down" ? "↓" : "→";
            return (
              <div key={i} className="bg-white rounded-[1.5rem] border border-stone-200 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-stone-800 mb-1">{f.crop}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-stone-500 font-medium">Current MSP: <span className="font-bold text-stone-700">{f.currentMSP}</span></span>
                      <span className={cn("text-sm font-bold px-2.5 py-0.5 rounded-full", trendColor)}>
                        {trendIcon} {f.trend}ward
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-400 mb-1">Predicted (3 months)</p>
                    <p className="text-2xl font-extrabold text-stone-800">{f.predicted3Month}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Forecast Confidence</span>
                  </div>
                  <ConfidenceBar value={f.confidence} />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Key Factors</p>
                  <div className="flex flex-wrap gap-2">
                    {f.factors.map((factor, fi) => (
                      <span key={fi} className="text-xs font-semibold px-3 py-1.5 bg-stone-50 text-stone-600 rounded-full border border-stone-200">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 font-medium">
              Price predictions are based on historical APMC mandi data, government MSP announcements,
              and macroeconomic signals. Actual prices may vary. Always cross-check with your local mandi before selling.
            </p>
          </div>
        </div>
      )}

      {activeTab === "plan" && (
        <div className="bg-white rounded-[1.5rem] border border-stone-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-stone-800">Seasonal Action Plan</h3>
          </div>
          <div className="space-y-4">
            {result.actionPlan.map((action, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-stone-200 group-hover:border-emerald-400 flex items-center justify-center shrink-0 font-bold text-stone-500 group-hover:text-emerald-600 transition-colors text-sm">
                  {i + 1}
                </div>
                <p className="text-sm font-semibold text-stone-700 group-hover:text-stone-900 transition-colors leading-relaxed pt-1">{action}</p>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-500 ml-auto shrink-0 mt-1 transition-colors" />
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap gap-3">
            <button className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm text-sm">
              <Star className="w-4 h-4" />
              Save Report
            </button>
            <button className="flex items-center gap-2 bg-stone-100 text-stone-700 px-6 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors text-sm">
              Share with Agronomist
            </button>
            <button onClick={onReset}
              className="flex items-center gap-2 text-stone-500 px-6 py-3 rounded-xl font-bold hover:text-stone-800 hover:bg-stone-100 transition-colors text-sm ml-auto">
              <RefreshCw className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AiRecommendations() {
  const [step, setStep] = useState<Step>("input");
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const handleAnalyze = (input: FarmInput) => {
    setStep("analyzing");
    // Simulate ML pipeline latency (3.5 s)
    setTimeout(() => {
      setResult(generateMockResults(input));
      setStep("results");
    }, 3500);
  };

  const handleReset = () => {
    setResult(null);
    setStep("input");
  };

  return (
    <div className="space-y-2 pb-8">
      {step === "input" && <InputSection onAnalyze={handleAnalyze} />}
      {step === "analyzing" && <AnalyzingState />}
      {step === "results" && result && <ResultsSection result={result} onReset={handleReset} />}
    </div>
  );
}
