import axios from './axios';
import errorHandler from '../utils/errorHandler';

// Get receipt analytics overview
export const getReceiptAnalyticsOverview = async (period = '30d') => {
  try {
    const response = await axios.get(`/analytics/receipts/overview?period=${period}`);
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => getReceiptAnalyticsOverview(period));
  }
};


// Get merchant insights
export const getMerchantInsights = async (period = '30d') => {
  try {
    const response = await axios.get(`/analytics/receipts/merchant-insights?period=${period}`);
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => getMerchantInsights(period));
  }
};

// Get time-based analytics
export const getTimeBasedAnalytics = async (period = '30d', granularity = 'daily') => {
  try {
    const response = await axios.get(`/analytics/receipts/time-based?period=${period}&granularity=${granularity}`);
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => getTimeBasedAnalytics(period, granularity));
  }
};

// Get receipt processing statistics
export const getProcessingStats = async (period = '30d') => {
  try {
    const response = await axios.get(`/analytics/receipts/processing-stats?period=${period}`);
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => getProcessingStats(period));
  }
};
