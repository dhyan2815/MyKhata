import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, isLoading = false }) => {
  const bgColor = `bg-${color}-50`;
  const textColor = `text-${color}-700`;
  const iconBgColor = `bg-${color}-500`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg p-5 shadow-sm border border-gray-200 ${bgColor}`}
    >
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">{title}</p>
              <h3 className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</h3>
            </div>
            <div className={`p-2 rounded-full ${iconBgColor} text-white`}>
              {icon}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default StatCard;