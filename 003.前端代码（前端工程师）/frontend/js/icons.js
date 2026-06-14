/**
 * 灵记 - 本地 SVG 图标库
 * 替代 Google Fonts Material Symbols，国内网络可正常加载
 *
 * 用法：在 HTML 中引入此脚本后，自动替换所有 .material-symbols-outlined 元素
 * <script src="../js/icons.js"></script>
 */

// ===== SVG 图标路径定义 (24x24 viewBox) =====
const ICON_PATHS = {
  // 导航
  'home': 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  'home_filled': 'M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z',
  'arrow_back_ios': 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  'chevron_right': 'M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z',
  'person': 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  'person_filled': 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',

  // 操作
  'add': 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  'edit': 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  'delete': 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  'delete_forever': 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z',
  'settings': 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  'logout': 'M17 8l-1.41 1.41L17.17 11H9v2h8.17l-1.58 1.58L17 16l4-4-4-4zM5 5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-2H5V5z',
  'search': 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  'swap_horiz': 'M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z',
  'download': 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  'upload': 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z',
  'cloud_upload': 'M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z',
  'cloud_sync': 'M21.5 13.5c.32-1.1.5-2.26.5-3.5 0-1.29-.21-2.5-.58-3.65L24 5.32 22.68 4l-1.55 1.55A9.88 9.88 0 0012 2C7.54 2 3.66 4.67 1.82 8.41L4 9.87A8 8 0 0112 4c2.18 0 4.16.88 5.6 2.3L15.3 8.5H22v-6.5l-1.5 1.5zM6.5 14.5A4 4 0 0110 11c.93 0 1.77.33 2.43.87L14 10.7A5.96 5.96 0 009.5 9 6 6 0 004 12.6l2.5 1.9zM2.5 10.5C2.18 11.6 2 12.76 2 14c0 1.29.21 2.5.58 3.65L0 18.68 1.32 20l1.55-1.55A9.88 9.88 0 0012 22c4.46 0 8.34-2.67 10.18-6.41L20 14.13A8 8 0 0112 20c-2.18 0-4.16-.88-5.6-2.3L8.7 15.5H2v6.5L.5 20.5zM10 17c0 .55.45 1 1 1 .34 0 .63-.17.82-.42l4.6-4.6c.29-.29.29-.77 0-1.06l-4.6-4.6A.997.997 0 0011 7c-.55 0-1 .45-1 1v1H6v2h4v1c0 .55.45 1 1 1 .34 0 .63-.17.82-.42l4.6-4.6c.29-.29.29-.77 0-1.06l-4.6-4.6A.997.997 0 0011 7c-.55 0-1 .45-1 1v1H6v2h4v1z',

  // 财务
  'account_balance_wallet': 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
  'trending_down': 'M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z',
  'trending_up': 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  'receipt': 'M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z',
  'receipt_long': 'M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5zM19 19H5V5h14v14zM6 9h12v2H6V9zm0 4h8v2H6v-2z',
  'edit_note': 'M3 10h11v2H3v-2zm0-4h11v2H3V6zm0 8h7v2H3v-2zm14.3-2.06l1.41-1.41 3.09 3.09-1.41 1.41-3.09-3.09zm-1.48 1.48L12 21v2h2l3.82-3.82-1.98-1.98z',
  'leaderboard': 'M7.5 21H2V9h5.5v12zm7.25 0h-5.5V3h5.5v18zm7.25 0h-5.5V12h5.5v9z',
  'leaderboard_filled': 'M7.5 21H2V9h5.5v12zm7.25 0h-5.5V3h5.5v18zm7.25 0h-5.5V12h5.5v9z',

  // 日历 / 时间
  'calendar_month': 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
  'date_range': 'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z',

  // 分类/数据
  'category': 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.86L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z',
  'analytics': 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-5h2v5zm4 0h-2V7h2v10zm4 0h-2v-3h2v3z',
  'table': 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 5h6v4H5V5zm6 6v4H5v-4h6zm2 0h6v4h-6v-4zm6-2h-6V5h6v4z',
  'file_export': 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm12.36-7.36L15.64 10H18v6h-2.36l2.72 2.64L20 17l-4-4 4-4-1.64-1.36z',

  // 安全
  'shield': 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
  'lock': 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z',
  'warning': 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  'info': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  'visibility': 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
  'visibility_off': 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
  'photo_camera': 'M12 15.2c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4.2c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2-1.2-.54-1.2-1.2.54-1.2 1.2-1.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
};

/**
 * 创建 SVG 元素
 * @param {string} iconName - 图标名称
 * @param {boolean} filled - 是否填充样式
 * @returns {SVGElement}
 */
function createSVGIcon(iconName, filled) {
  const filledName = iconName + '_filled';
  const key = filled && ICON_PATHS[filledName] ? filledName : iconName;
  const pathData = ICON_PATHS[key] || ICON_PATHS['info']; // fallback to info icon

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '1em');
  svg.setAttribute('height', '1em');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.display = 'inline-block';
  svg.style.verticalAlign = 'middle';
  svg.style.flexShrink = '0';

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', pathData);
  svg.appendChild(path);

  return svg;
}

/**
 * 替换单个 Material Symbols 元素为 SVG 图标
 * @param {HTMLElement} el - .material-symbols-outlined 元素
 */
function replaceIconElement(el) {
  if (el.dataset.iconReplaced === 'true') return;

  const iconName = el.textContent.trim();
  if (!iconName || !ICON_PATHS[iconName]) {
    // 无匹配图标时隐藏文字，保留占位
    el.textContent = '';
    el.dataset.iconReplaced = 'true';
    return;
  }

  // 检查父元素上是否有 FILL 设置
  let filled = false;
  const style = el.getAttribute('style') || '';
  const fillMatch = style.match(/FILL['"]?\s*:\s*['"]?(\d)/i);
  if (fillMatch && fillMatch[1] === '1') {
    filled = true;
  }

  const svg = createSVGIcon(iconName, filled);

  // 继承原元素的行内样式中的 font-size
  const fontSizeMatch = style.match(/font-size\s*:\s*([^;]+)/i);
  if (fontSizeMatch) {
    svg.style.fontSize = fontSizeMatch[1].trim();
  }

  // 替换内容
  el.textContent = '';
  el.appendChild(svg);
  el.dataset.iconReplaced = 'true';
}

/**
 * 扫描并替换页面中所有 Material Symbols 图标
 */
function replaceAllIcons(root) {
  const elements = (root || document).querySelectorAll('.material-symbols-outlined');
  elements.forEach(replaceIconElement);
}

// ===== 初始化 =====
// 提前部署 MutationObserver，确保捕获其他脚本动态渲染的图标（如 TabBar）
const iconObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        replaceAllIcons(node);
      }
    }
  }
});

// 在 DOM 就绪后：替换静态图标 + 开启动态监听
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    replaceAllIcons();
    iconObserver.observe(document.body, { childList: true, subtree: true });
  });
} else {
  // DOM 已就绪（脚本被动态加载的情况）
  replaceAllIcons();
  iconObserver.observe(document.body, { childList: true, subtree: true });
}
