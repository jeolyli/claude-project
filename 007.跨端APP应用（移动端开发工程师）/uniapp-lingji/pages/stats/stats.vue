<template>
  <view class="app-container">
    <AppHeader title="统计" showTabBar />
    <view class="main-content stats-page">
      <!-- Period Toggle -->
      <view class="stats-period">
        <view class="period-toggle">
          <view class="period-btn" :class="{ 'period-btn--active': period === 'week' }" @tap="period = 'week'">
            <text>本周</text>
          </view>
          <view class="period-btn" :class="{ 'period-btn--active': period === 'month' }" @tap="period = 'month'">
            <text>本月</text>
          </view>
        </view>
      </view>

      <!-- Summary Cards -->
      <view class="stats-summary">
        <view class="summary-card summary-card--income">
          <text class="summary-label">总收入</text>
          <text class="summary-value">¥{{ fmt(summaryIncome) }}</text>
        </view>
        <view class="summary-card summary-card--expense">
          <text class="summary-label">总支出</text>
          <text class="summary-value">¥{{ fmt(summaryExpense) }}</text>
        </view>
        <view class="summary-card summary-card--mascot">
          <text class="summary-mascot">🐰</text>
          <text class="summary-msg">{{ mascotMsg }}</text>
          <text class="summary-daily">日均支出 ¥{{ fmt(dailyAvg) }}</text>
        </view>
      </view>

      <!-- Line Chart -->
      <view class="chart-section">
        <text class="section-title">📈 每日趋势</text>
        <view class="chart-card">
          <image v-if="lineSvg" class="chart-img" :src="lineSvg" mode="widthFix" />
          <view v-else class="chart-empty"><text>暂无数据</text></view>
          <view class="chart-legend">
            <view class="legend-item"><view class="ldot ldot--e" /><text>支出</text></view>
            <view class="legend-item"><view class="ldot ldot--i" /><text>收入</text></view>
          </view>
        </view>
      </view>

      <!-- Ring Chart -->
      <view class="chart-section">
        <text class="section-title">🍩 分类占比</text>
        <view class="chart-card">
          <image v-if="ringSvg" class="chart-img" :src="ringSvg" mode="widthFix" />
          <view v-else class="chart-empty"><text>暂无支出数据</text></view>
          <view v-if="ringLegend.length" class="rlegend">
            <view v-for="(it, idx) in ringLegend" :key="idx" class="rrow">
              <view class="rdot" :style="{ backgroundColor: it.color }" />
              <text class="rname">{{ it.name }}</text>
              <text class="rpct">{{ it.pct }}%</text>
              <text class="rval">¥{{ it.val }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </view>
    <CustomTabBar currentTab="stats" />
    <LingToast />
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '../../store/user.js';
import { useDataStore } from '../../store/data.js';
import AppHeader from '../../components/AppHeader.vue';
import CustomTabBar from '../../components/CustomTabBar.vue';
import LingToast from '../../components/LingToast.vue';

const userStore = useUserStore();
const dataStore = useDataStore();
const period = ref('month');

const CLR = ['#FFAB91','#9EB7D4','#FFB3C6','#F0D5BE','#C5A3D9','#A8D8CA','#F9E4B7','#D4C5CB'];

function getDays() {
  const n = new Date();
  if (period.value === 'week') {
    const dow = n.getDay(), off = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(n.getFullYear(), n.getMonth(), n.getDate() + off);
    const arr = [];
    for (let i = 0; i < 7; i++) { const d = new Date(mon); d.setDate(d.getDate()+i); arr.push(d.toISOString().slice(0,10)); }
    return arr;
  }
  const y = n.getFullYear(), m = n.getMonth() + 1, cnt = new Date(y, m, 0).getDate();
  const arr = [];
  for (let i = 1; i <= cnt; i++) arr.push(`${y}-${String(m).padStart(2,'0')}-${String(i).padStart(2,'0')}`);
  return arr;
}

function fmt(v) { const n = parseFloat(v); return isNaN(n) ? '0' : n.toLocaleString('zh-CN',{maximumFractionDigits:0}); }

const raw = computed(() => {
  const days = getDays();
  const pts = []; let sumE = 0, sumI = 0;
  days.forEach((d,i) => {
    let e = 0, ic = 0;
    dataStore.transactions.forEach(t => {
      if (t.date !== d) return;
      if (t.type === 'expense') e += parseFloat(t.amount)||0;
      else ic += parseFloat(t.amount)||0;
    });
    sumE += e; sumI += ic;
    const lb = period.value === 'week'
      ? ['一','二','三','四','五','六','日'][new Date(d).getDay()===0?6:new Date(d).getDay()-1]
      : String(new Date(d).getDate());
    pts.push({ e, ic, lb, d });
  });
  return { pts, sumE, sumI, days };
});

const summaryExpense = computed(() => raw.value.sumE);
const summaryIncome = computed(() => raw.value.sumI);
const dailyAvg = computed(() => raw.value.sumE / Math.max(1, raw.value.days.length));
const mascotMsg = computed(() => {
  const a = dailyAvg.value;
  if (a===0) return '还没有消费记录哦～';
  if (a<50) return '消费很克制呢，真棒！👍';
  if (a<200) return '日常消费还算健康～';
  if (a<500) return '稍微有点多了哦～';
  return '灵灵提醒你控制开销！';
});

// ===== Line SVG =====
const lineSvg = computed(() => {
  const pts = raw.value.pts;
  if (!pts.length || !pts.some(p => p.e>0||p.ic>0)) return '';

  const W = 360, H = 240, PL = 44, PR = 16, PT = 24, PB = 32;
  const cw = W - PL - PR, ch = H - PT - PB;
  let mx = 1; pts.forEach(p => { mx = Math.max(mx, p.e, p.ic); });

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  // Grid
  for (let i=0;i<=4;i++) {
    const y = PT + (ch/4)*i;
    svg += `<line x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}" stroke="#FFEEF2" stroke-width="0.5"/>`;
    svg += `<text x="${PL-4}" y="${y+4}" fill="#B5A4AB" font-size="9" text-anchor="end">${Math.round(mx/4*(4-i))}</text>`;
  }
  // X labels
  const skip = Math.max(1, Math.ceil(pts.length/8));
  const xs = pts.map((_,i) => PL + (cw/Math.max(1,pts.length-1))*i);
  pts.forEach((p,i) => {
    if (i%skip===0 || i===pts.length-1) svg += `<text x="${xs[i]}" y="${H-PB+18}" fill="#B5A4AB" font-size="9" text-anchor="middle">${p.lb}</text>`;
  });
  // Expense line
  const ep = pts.map((p,i) => `${xs[i]},${PT+ch-(p.e/mx)*ch}`).join(' ');
  svg += `<polyline points="${ep}" fill="none" stroke="#FF85A2" stroke-width="2" stroke-linecap="round"/>`;
  // Income line
  const ip = pts.map((p,i) => `${xs[i]},${PT+ch-(p.ic/mx)*ch}`).join(' ');
  svg += `<polyline points="${ip}" fill="none" stroke="#A8D8CA" stroke-width="2" stroke-linecap="round"/>`;
  // Dots
  pts.forEach((p,i) => {
    if (p.e>0||pts.length<=14) svg += `<circle cx="${xs[i]}" cy="${PT+ch-(p.e/mx)*ch}" r="3" fill="#FF85A2"/>`;
    if (p.ic>0||pts.length<=14) svg += `<circle cx="${xs[i]}" cy="${PT+ch-(p.ic/mx)*ch}" r="3" fill="#A8D8CA"/>`;
  });
  svg += '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
});

// ===== Ring SVG =====
const ringLegend = ref([]);

const ringSvg = computed(() => {
  const days = raw.value.days;
  const map = {};
  dataStore.transactions.filter(t => t.type==='expense'&&days.includes(t.date)).forEach(t => {
    const n = t.category||'其他'; map[n] = (map[n]||0)+(parseFloat(t.amount)||0);
  });
  const entries = Object.entries(map).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  if (!entries.length) { ringLegend.value = []; return ''; }
  const total = entries.reduce((s,[,v])=>s+v,0);

  const W=320, H=220, cx=160, cy=105, R=70, ir=38;
  let sa = -Math.PI/2;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  const leg = [];

  entries.forEach(([name, val], i) => {
    const angle = Math.max(0.06, (val/total)*Math.PI*2);
    const color = CLR[i%CLR.length];
    const x1=cx+R*Math.cos(sa), y1=cy+R*Math.sin(sa);
    const x2=cx+R*Math.cos(sa+angle), y2=cy+R*Math.sin(sa+angle);
    const x3=cx+ir*Math.cos(sa+angle), y3=cy+ir*Math.sin(sa+angle);
    const x4=cx+ir*Math.cos(sa), y4=cy+ir*Math.sin(sa);
    const la = angle>Math.PI?1:0;
    svg += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 ${la} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} A${ir} ${ir} 0 ${la} 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;
    leg.push({ name, val: Math.round(val), pct: Math.round(val/total*100), color });
    sa += angle;
  });

  svg += `<text x="${cx}" y="${cy+5}" fill="#3D2C33" font-size="16" font-weight="bold" text-anchor="middle">¥${Math.round(total).toLocaleString()}</text>`;
  svg += '</svg>';
  ringLegend.value = leg;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
});

onShow(() => {
  if (!userStore.isLoggedIn) { uni.reLaunch({ url: '/pages/auth/login' }); return; }
  if (!dataStore.isLoaded) dataStore.loadData(userStore.currentUserId);
});
</script>

<style scoped>
.stats-page { gap: 20rpx; }
.stats-period { display: flex; justify-content: center; }
.period-toggle { display: flex; background: white; border-radius: 48rpx; padding: 6rpx; }
.period-btn { padding: 16rpx 48rpx; border-radius: 48rpx; font-size: 26rpx; color: #B5A4AB; }
.period-btn--active { background: #FF85A2; color: white; font-weight: 600; }
.stats-summary { display: flex; flex-wrap: wrap; gap: 16rpx; }
.summary-card { flex: 1; min-width: 40%; padding: 28rpx; border-radius: 32rpx; display: flex; flex-direction: column; gap: 8rpx; }
.summary-card--income { background: linear-gradient(135deg, #A8D8CA, #C5E8D7); color: white; }
.summary-card--expense { background: linear-gradient(135deg, #FF85A2, #FFB3C6); color: white; }
.summary-card--mascot { flex: 1 1 100%; background: white; align-items: center; text-align: center; }
.summary-label { font-size: 24rpx; opacity: 0.85; }
.summary-value { font-size: 40rpx; font-weight: 700; }
.summary-mascot { font-size: 60rpx; animation: heartbeat 2s ease-in-out infinite; }
.summary-msg { font-size: 26rpx; color: #6B5B63; margin-top: 4rpx; }
.summary-daily { font-size: 22rpx; color: #B5A4AB; }

.chart-section { display: flex; flex-direction: column; gap: 16rpx; }
.chart-card { background: white; border-radius: 40rpx; padding: 24rpx 16rpx; display: flex; flex-direction: column; align-items: center; }
.chart-img { width: 100%; display: block; }
.chart-empty { padding: 80rpx 0; font-size: 26rpx; color: #B5A4AB; text-align: center; }

.chart-legend { display: flex; justify-content: center; gap: 32rpx; margin-top: 8rpx; }
.legend-item { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; color: #6B5B63; }
.ldot { width: 20rpx; height: 20rpx; border-radius: 50%; }
.ldot--e { background: #FF85A2; }
.ldot--i { background: #A8D8CA; }

.rlegend { width: 100%; padding: 12rpx 8rpx 0; display: flex; flex-direction: column; gap: 12rpx; }
.rrow { display: flex; align-items: center; gap: 12rpx; }
.rdot { width: 20rpx; height: 20rpx; border-radius: 50%; flex-shrink: 0; }
.rname { flex: 1; font-size: 26rpx; color: #3D2C33; }
.rpct { font-size: 24rpx; color: #B5A4AB; min-width: 60rpx; text-align: right; }
.rval { font-size: 24rpx; color: #6B5B63; min-width: 100rpx; text-align: right; }
</style>
