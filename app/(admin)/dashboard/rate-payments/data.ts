export interface PaymentVolumeData {
  date: Date;
  volume: number;
}

// Generate mock daily data for the last 90 days (more data points)
export const generateDailyData = (): PaymentVolumeData[] => {
  const data: PaymentVolumeData[] = [];
  const today = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // Random volume between 1000 and 8000
    const volume = Math.floor(Math.random() * 7000) + 1000;
    data.push({ date, volume });
  }
  
  return data;
};

// Generate mock weekly data for the last 52 weeks (full year)
export const generateWeeklyData = (): PaymentVolumeData[] => {
  const data: PaymentVolumeData[] = [];
  const today = new Date();
  
  for (let i = 51; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7));
    // Random volume between 5000 and 25000
    const volume = Math.floor(Math.random() * 20000) + 5000;
    data.push({ date, volume });
  }
  
  return data;
};

// Generate mock monthly data for the last 24 months (2 years)
export const generateMonthlyData = (): PaymentVolumeData[] => {
  const data: PaymentVolumeData[] = [];
  const today = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    // Random volume between 20000 and 100000
    const volume = Math.floor(Math.random() * 80000) + 20000;
    data.push({ date, volume });
  }
  
  return data;
};

export const dailyData = generateDailyData();
export const weeklyData = generateWeeklyData();
export const monthlyData = generateMonthlyData();
