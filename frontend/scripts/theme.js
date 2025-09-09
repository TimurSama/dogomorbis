export function applyTheme(theme) {
  if (!theme) theme = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark":"light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("dm-theme", theme);
}
export function initThemeToggle(selector){
  const saved = localStorage.getItem("dm-theme");
  applyTheme(saved || null);
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.addEventListener("click", ()=>{
    const cur = document.documentElement.getAttribute("data-theme")==="dark" ? "light":"dark";
    applyTheme(cur);
  });
}



