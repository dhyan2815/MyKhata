import { motion } from 'framer-motion';

// StatCard component displays a statistic with an icon, title, and value
const StatCard = ({ title, value, icon, color, isLoading = false, index = 0 }) => {
  // Dynamically set background and text colors based on the color prop
  const bgColor = `bg-${color}-50`;
  const textColor = `text-${color}-700`;
  const iconBgColor = `bg-${color}-500`;

  return (
    // Animate the card appearance using framer-motion with staggered delay
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={`rounded-lg p-5 shadow-sm border border-gray-200 ${bgColor} cursor-pointer`}
    >
      {isLoading ? (
        // Show loading skeleton if data is loading
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              {/* Title of the stat */}
              <p className="text-gray-500 text-sm font-medium">{title}</p>
              {/* Value of the stat */}
              <h3 className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</h3>
            </div>
            {/* Icon with colored background */}
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