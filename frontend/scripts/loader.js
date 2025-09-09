const LOADER_FILES = {
  ball: "/assets/loaders/loader-ball.svg",
  pawtrail: "/assets/loaders/loader-pawtrail.svg",
  medallion: "/assets/loaders/loader-medallion.svg",
};

export function showLoader({ type = "random", label = "Загрузка…" } = {}) {
  if (type === "random") {
    const choices = ["ball", "pawtrail", "medallion"];
    type = choices[Math.floor(Math.random()*choices.length)];
  }
  const host = document.createElement("div");
  host.className = "overlay";
  host.style.zIndex = "9999";

  const box = document.createElement("div");
  box.style.display = "grid";
  box.style.placeItems = "center";
  box.style.gap = "12px";

  const obj = document.createElement("object");
  obj.setAttribute("type", "image/svg+xml");
  obj.setAttribute("width", "72");
  obj.setAttribute("height", "72");
  obj.setAttribute("data", LOADER_FILES[type]);

  const text = document.createElement("div");
  text.textContent = label;
  text.style.font = "14px/1.4 var(--font-sans)";
  text.style.color = "var(--text-dim)";

  box.appendChild(obj); box.appendChild(text);
  host.appendChild(box);
  document.body.appendChild(host);
  return host;
}
export function hideLoader(host){ if (host && host.remove) host.remove(); }



