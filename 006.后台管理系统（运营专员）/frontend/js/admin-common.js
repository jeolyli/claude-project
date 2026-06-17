/**
 * 管理后台公共逻辑
 */
const adminAPI = 'http://localhost:3002/api/admin';

async function fetchJSON(path) {
  const token = localStorage.getItem('lingji_admin_token');
  const r = await fetch(adminAPI + path, { headers: { Authorization: `Bearer ${token}` } });
  return r.json();
}

function checkAuth() {
  if (!localStorage.getItem('lingji_admin_token')) {
    location.href = 'login.html';
  }
}

function fmt(v) {
  const n = parseFloat(v);
  return isNaN(n) ? '0' : n.toLocaleString();
}

function fmtDate(d) {
  if (!d) return '-';
  return String(d).slice(0, 10);
}
