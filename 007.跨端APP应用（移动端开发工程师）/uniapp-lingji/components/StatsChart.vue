<template>
  <view class="chart-wrapper">
    <canvas
      :canvas-id="canvasId"
      :id="canvasId"
      class="chart-canvas"
      :style="{ width: cw + 'px', height: ch + 'px' }"
    />
    <view v-if="type === 'ring' && ringLegend.length" class="ring-legend">
      <view v-for="(item, idx) in ringLegend" :key="idx" class="legend-row">
        <view class="legend-dot" :style="{ backgroundColor: item.color }" />
        <text class="legend-name">{{ item.name }}</text>
        <text class="legend-pct">{{ item.pct }}%</text>
        <text class="legend-val">¥{{ item.val }}</text>
      </view>
    </view>
  </view>
</template>

<script>
const COLORS = ['#FFAB91', '#9EB7D4', '#FFB3C6', '#F0D5BE', '#C5A3D9', '#A8D8CA', '#F9E4B7', '#D4C5CB'];

export default {
  name: 'StatsChart',
  props: {
    type: { type: String, default: 'line' },
    data: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      canvasId: 'ch_' + Math.random().toString(36).slice(2, 8),
      cw: 340,
      ch: this.type === 'line' ? 260 : 240,
      ringLegend: [],
      drawn: false,
    };
  },
  mounted() {
    this.ch = this.type === 'line' ? 260 : 240;
    // Retry drawing — canvas might not be ready immediately on Android
    this.tryDraw(0);
  },
  beforeUnmount() {
    if (this._retryTimer) clearTimeout(this._retryTimer);
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.drawn = false;
        this.$nextTick(() => this.tryDraw(0));
      },
    },
    type() {
      this.ch = this.type === 'line' ? 260 : 240;
      this.drawn = false;
      this.$nextTick(() => this.tryDraw(0));
    },
  },
  methods: {
    tryDraw(attempt) {
      if (this.drawn && attempt > 0) return;
      const info = uni.getSystemInfoSync();
      this.cw = info.windowWidth - 96;

      if (this.type === 'line') {
        this.drawLine();
      } else {
        this.drawRing();
      }
      this.drawn = true;

      // Retry up to 3 times if canvas might not be ready
      if (attempt < 3) {
        this._retryTimer = setTimeout(() => {
          if (this.type === 'line') this.drawLine();
          else this.drawRing();
        }, 200 * (attempt + 1));
      }
    },

    drawLine() {
      const ctx = uni.createCanvasContext(this.canvasId, this);
      const { series, categories } = this.data || {};

      if (!series || !categories || !categories.length) {
        this.drawEmpty(ctx, '暂无数据');
        ctx.draw();
        return;
      }

      const hasData = series.some((s) => s.data && s.data.some((v) => v > 0));
      if (!hasData) {
        this.drawEmpty(ctx, '暂无数据');
        ctx.draw();
        return;
      }

      const pad = { top: 30, right: 16, bottom: 36, left: 40 };
      const pw = this.cw - pad.left - pad.right;
      const ph = this.ch - pad.top - pad.bottom;

      let maxVal = 1;
      series.forEach((s) => {
        if (s.data) s.data.forEach((v) => { maxVal = Math.max(maxVal, v || 0); });
      });

      // Grid + Y labels
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (ph / 4) * i;
        ctx.setStrokeStyle('#FFEEF2');
        ctx.setLineWidth(0.5);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(this.cw - pad.right, y);
        ctx.stroke();

        ctx.setFillStyle('#B5A4AB');
        ctx.setFontSize(10);
        ctx.setTextAlign('right');
        ctx.fillText(String(Math.round((maxVal / 4) * (4 - i))), pad.left - 6, y + 3);
      }

      // X labels
      const xStep = pw / Math.max(1, categories.length - 1);
      const skip = Math.max(1, Math.ceil(categories.length / 8));
      ctx.setFillStyle('#B5A4AB');
      ctx.setFontSize(10);
      ctx.setTextAlign('center');
      categories.forEach((label, i) => {
        if (i % skip === 0 || i === categories.length - 1) {
          ctx.fillText(String(label), pad.left + xStep * i, this.ch - pad.bottom + 18);
        }
      });

      // Lines + dots
      series.forEach((s) => {
        if (!s.data || !s.data.length) return;
        ctx.setStrokeStyle(s.color || '#FF85A2');
        ctx.setLineWidth(2);
        ctx.setLineCap('round');
        ctx.beginPath();
        s.data.forEach((val, i) => {
          const x = pad.left + xStep * i;
          const y = pad.top + ph - ((val || 0) / maxVal) * ph;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        s.data.forEach((val, i) => {
          if (categories.length > 14 && val === 0) return;
          const x = pad.left + xStep * i;
          const y = pad.top + ph - ((val || 0) / maxVal) * ph;
          ctx.setFillStyle(s.color || '#FF85A2');
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      ctx.draw();
    },

    drawRing() {
      const ctx = uni.createCanvasContext(this.canvasId, this);
      const { series, categories } = this.data || {};
      const data = series && series[0] ? (series[0].data || []).filter((v) => v > 0) : [];

      if (!data.length) {
        this.drawEmpty(ctx, '暂无支出数据');
        ctx.draw();
        this.ringLegend = [];
        return;
      }

      const total = data.reduce((a, b) => a + b, 0);
      if (total <= 0) {
        this.drawEmpty(ctx, '暂无支出数据');
        ctx.draw();
        this.ringLegend = [];
        return;
      }

      const cx = this.cw / 2;
      const cy = this.ch / 2;
      const r = Math.min(this.cw, this.ch) / 3;
      const ir = r * 0.5;
      let sa = -Math.PI / 2;

      this.ringLegend = [];

      data.forEach((val, idx) => {
        const angle = Math.max(0.06, (val / total) * Math.PI * 2);
        const color = COLORS[idx % COLORS.length];

        // Fill arc using filled path
        ctx.setFillStyle(color);
        ctx.beginPath();
        ctx.arc(cx, cy, r, sa, sa + angle);
        ctx.arc(cx, cy, ir, sa + angle, sa, true);
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.setStrokeStyle('#ffffff');
        ctx.setLineWidth(1.5);
        ctx.beginPath();
        ctx.arc(cx, cy, r, sa, sa + angle);
        ctx.stroke();

        this.ringLegend.push({
          name: (categories && categories[idx]) || '分类' + (idx + 1),
          val: Math.round(val),
          pct: Math.round((val / total) * 100),
          color,
        });

        sa += angle;
      });

      // Center text
      ctx.setFillStyle('#3D2C33');
      ctx.setFontSize(16);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText('¥' + Math.round(total).toLocaleString(), cx, cy);

      ctx.draw();
    },

    drawEmpty(ctx, text) {
      ctx.setFillStyle('#B5A4AB');
      ctx.setFontSize(14);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText(text, this.cw / 2, this.ch / 2);
    },
  },
};
</script>

<style scoped>
.chart-wrapper { width: 100%; display: flex; flex-direction: column; align-items: center; }
.chart-canvas { display: block; }

.ring-legend { width: 100%; padding: 16rpx 8rpx 0; display: flex; flex-direction: column; gap: 12rpx; }
.legend-row { display: flex; align-items: center; gap: 12rpx; }
.legend-dot { width: 20rpx; height: 20rpx; border-radius: 50%; flex-shrink: 0; }
.legend-name { flex: 1; font-size: 26rpx; color: #3D2C33; }
.legend-pct { font-size: 24rpx; color: #B5A4AB; min-width: 60rpx; text-align: right; }
.legend-val { font-size: 24rpx; color: #6B5B63; min-width: 100rpx; text-align: right; }
</style>
