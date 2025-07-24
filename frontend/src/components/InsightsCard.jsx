import { Lightbulb } from 'lucide-react';

const InsightsCard = ({ insights = [], isLoading = false }) => {
  return (
    <div className="rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center mb-3">
        <div className="p-2 rounded-full bg-yellow-500 text-white mr-3">
          <Lightbulb size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Insights</h2>
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ) : insights.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No insights available yet. Keep tracking your spending!</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {insights.map((insight, idx) => (
            <li key={idx} className="text-gray-800 dark:text-gray-200 text-sm">
              {insight}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InsightsCard; 