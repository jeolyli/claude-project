/**
 * 灵记 - 统计页逻辑
 * Chart.js 饼图 + 折线图 + 时间切换
 */

import { initPage, renderTabBar } from './app.js';
import { getUserData } from './storage.js';

let currentUser = null;
let currentPeriod = 'week'; // 'week' | 'month'
let pieChart = null;
let lineChart = null;

document.addEventListener('DOMContentLoaded', () => {
  currentUser = initPage();
  if (!currentUser) return;

  // 渲染 TabBar
  const tabBar = document.getElementById('tabBar');
  if (tabBar) renderTabBar('stats', tabBar);

  // 时间切换
  document.querySelectorAll('.stats-time-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentPeriod = btn.dataset.period;
      document.querySelectorAll('.stats-time-btn').forEach((b) => b.classList.remove('stats-time-btn--active'));
      btn.classList.add('stats-time-btn--active');
      renderCharts();
    });
  });

  // 加载图表
  loadChartJS().then(() => {
    renderCharts();
  });
});

async function loadChartJS() {
  if (window.Chart) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '../js/vendor/chart.umd.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function renderCharts() {
  const data = getUserData(currentUser.id);
  renderSummary(data);
  renderPieChart(data);
  renderLineChart(data);
}

// ===== 汇总卡片 =====
function renderSummary(data) {
  const now = new Date();
  let startDate, endDate;

  if (currentPeriod === 'week') {
    const dayOfWeek = now.getDay() || 7; // 周日 = 7
    startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek + 1); // 本周一
    startDate = startDate.toISOString().slice(0, 10);
    endDate = now.toISOString().slice(0, 10);
  } else {
    startDate = now.toISOString().slice(0, 8) + '01'; // 本月1日
    endDate = now.toISOString().slice(0, 10);
  }

  const periodTx = data.transactions.filter((t) => t.date >= startDate && t.date <= endDate);
  const totalExpense = periodTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = periodTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  document.getElementById('statIncome').textContent = `¥${totalIncome.toFixed(2)}`;
  document.getElementById('statExpense').textContent = `¥${totalExpense.toFixed(2)}`;

  // 日均支出
  let days;
  if (currentPeriod === 'week') {
    days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1);
  } else {
    days = now.getDate();
  }
  const avgExpense = totalExpense / Math.max(1, days);

  const descEl = document.getElementById('mascotDesc');
  if (descEl) {
    descEl.textContent = `${currentPeriod === 'week' ? '本周' : '本月'}日均支出 ¥${avgExpense.toFixed(0)}，${
      avgExpense < 100 ? '控制得很棒哦！✨' : avgExpense < 300 ? '记得保持节奏～🌸' : '要注意规划开支啦 💪'
    }`;
  }
}

// ===== 饼图 - 分类占比 =====
function renderPieChart(data) {
  const ctx = document.getElementById('pieChart');
  if (!ctx || !window.Chart) return;

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const monthTx = data.transactions.filter((t) => t.date.startsWith(thisMonth) && t.type === 'expense');

  // 按分类汇总
  const categoryTotals = {};
  for (const tx of monthTx) {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  }

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);
  const userCategories = data.categories || [];
  const colors = labels.map((cat) => {
    const found = userCategories.find((c) => c.name === cat);
    return found ? found.color : '#D4C5CB';
  });

  if (pieChart) pieChart.destroy();

  if (labels.length === 0) {
    ctx.parentElement.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><p style="color:#B5A4AB;">暂无消费数据</p></div>';
    return;
  }

  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: 'white',
          borderWidth: 3,
          hoverBorderWidth: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 8,
            font: { size: 12, family: "'PingFang SC', 'Noto Sans SC', sans-serif" },
            generateLabels: (chart) => {
              const dataset = chart.data.datasets[0];
              return chart.data.labels.map((label, i) => ({
                text: `${label}  ¥${dataset.data[i].toFixed(0)}`,
                fillStyle: dataset.backgroundColor[i],
                strokeStyle: dataset.backgroundColor[i],
                pointStyle: 'circle',
                index: i,
              }));
            },
          },
        },
      },
    },
  });
}

// ===== 折线图 - 7天/30天趋势 =====
function renderLineChart(data) {
  const ctx = document.getElementById('lineChart');
  if (!ctx || !window.Chart) return;

  const now = new Date();
  let days, labels;

  if (currentPeriod === 'week') {
    days = 7;
    labels = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      labels.push(['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]);
    }
  } else {
    days = now.getDate();
    labels = [];
    for (let i = 1; i <= days; i++) {
      labels.push(`${i}日`);
    }
  }

  // 计算每日支出
  const dailyExpense = new Array(days).fill(0);
  const dailyIncome = new Array(days).fill(0);

  for (const tx of data.transactions) {
    const d = new Date(tx.date);
    let idx;
    if (currentPeriod === 'week') {
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
      idx = days - 1 - diffDays;
    } else {
      idx = d.getDate() - 1;
    }
    if (idx >= 0 && idx < days) {
      if (tx.type === 'expense') dailyExpense[idx] += tx.amount;
      else dailyIncome[idx] += tx.amount;
    }
  }

  if (lineChart) lineChart.destroy();

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '支出',
          data: dailyExpense,
          borderColor: '#FF85A2',
          backgroundColor: 'rgba(255, 133, 162, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#FF85A2',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
        {
          label: '收入',
          data: dailyIncome,
          borderColor: '#A8D8CA',
          backgroundColor: 'rgba(168, 216, 202, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#A8D8CA',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => '¥' + value,
            font: { size: 11 },
          },
          grid: { color: 'rgba(255, 133, 162, 0.06)' },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { size: 12, family: "'PingFang SC', 'Noto Sans SC', sans-serif" },
          },
        },
      },
    },
  });
}
