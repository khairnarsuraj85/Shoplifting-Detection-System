import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:5050/analytics');
        const data = await response.json();
        setChartData(data.chart);   // should return: { labels: [...], datasets: [...] }
        setStats(data.stats);       // should return: { alertsToday, accuracy, prevented, responseTime }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, family: "'Poppins', sans-serif" }
        }
      },
      title: {
        display: true,
        text: 'Suspicious Activity Trends',
        font: { size: 18, family: "'Poppins', sans-serif", weight: 'bold' },
        padding: 20
      },
      tooltip: {
        backgroundColor: '#222',
        padding: 10,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(200, 200, 200, 0.3)' },
        ticks: { font: { size: 12 } }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <section className="analytics">
      <div className="analytics-header">
        <h2>📈 Security Analytics</h2>
        <p>Real-time monitoring and historical insights</p>
      </div>

      <div className="analytics-grid">
        <div className="chart-container">
          <h3>Suspicious Activity Trends</h3>
          {loading ? (
            <div className="chart-loading">Loading data...</div>
          ) : chartData ? (
            <div className="chart-wrapper">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="chart-error">Failed to load chart</div>
          )}
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">{stats?.alertsToday ?? 'N/A'}</div>
            <div className="stat-label">Alerts Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.accuracy ?? 'N/A'}%</div>
            <div className="stat-label">Detection Accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.prevented ?? 'N/A'}</div>
            <div className="stat-label">Prevented Thefts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.responseTime ?? 'N/A'}s</div>
            <div className="stat-label">Avg. Response Time</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Analytics;
