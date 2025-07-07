import PriceComparisonTool from '@/components/PriceComparisonTool';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Global Price Comparison Tool
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find the best prices for any product across multiple websites and countries.
            Powered by AI for accurate product matching.
          </p>
        </div>
        <PriceComparisonTool />
      </div>
    </div>
  );
}
