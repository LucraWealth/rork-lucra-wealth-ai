import { DataPoint } from "@/components/CashbackChart";

export interface CashbackHistoryItem extends DataPoint {
  // No additional properties needed since we've updated DataPoint to match this interface
}

// Get current date to filter chart data
const getCurrentMonthData = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Create an array of months up to the current month
  const months = [
    { short: "Jan", full: "January" },
    { short: "Feb", full: "February" },
    { short: "Mar", full: "March" },
    { short: "Apr", full: "April" },
    { short: "May", full: "May" },
    { short: "Jun", full: "June" },
    { short: "Jul", full: "July" },
    { short: "Aug", full: "August" },
    { short: "Sep", full: "September" },
    { short: "Oct", full: "October" },
    { short: "Nov", full: "November" },
    { short: "Dec", full: "December" }
  ];
  
  // Generate cashback history for the past 12 months up to current month
  const history: CashbackHistoryItem[] = [];
  
  for (let i = 0; i < 12; i++) {
    // Calculate month index (going back from current month)
    let monthIndex = currentMonth - i;
    let year = currentYear;
    
    // Handle previous year
    if (monthIndex < 0) {
      monthIndex += 12;
      year -= 1;
    }
    
    // Generate random amount between 10 and 50
    const amount = Math.round((Math.random() * 40 + 10) * 100) / 100;
    
    // Create date string for the first day of the month
    const date = new Date(year, monthIndex, 1).toISOString();
    
    // Add to history (in reverse order so most recent is last)
    history.unshift({
      month: months[monthIndex].short,
      fullMonth: months[monthIndex].full,
      amount,
      date
    });
  }
  
  return history;
};

export const cashbackHistory: CashbackHistoryItem[] = getCurrentMonthData();