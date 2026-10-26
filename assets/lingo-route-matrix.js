(() => {
  "use strict";
  const ROUTES = [
    ["/","Home","Discover"],["/app/","That’s My Lingo","Play"],["/games/","Games","Play"],
    ["/account/","Account","Account"],["/community/","Community","Connect"],["/library/","Library","Discover"],
    ["/lane/","Loyalty Lane","Discover"],["/loyalty-lane-apparel/","Apparel","Shop"],
    ["/ai/","askLINGO","Tools"],["/studio/","Studio","Create"],["/contact/","Contact","Connect"]
  ];
  const css = [
    ".ll-route-matrix{position:relative;z-index:30;width:100%;box-sizing:border-box;padding:10px clamp(12px,3vw,36px);background:rgba(7,9,16,.96);border-bottom:1px solid rgba(230,189,88,.22);color:#f7f8fc;font:500 13px/1.4 system-ui,-apple-system,Segoe UI,sans-serif}",
    ".ll-route-matrix__inner{max-width:1440px;margin:auto;display:flex;align-items:center;gap:14px}",
    ".ll-route-matrix__brand{font-weight:900;letter-spacing:.09em;color:#e6bd58;text-decoration:none;white-space:nowrap}",
    ".ll-route-matrix__links{display:flex;align-items:center;gap:6px;flex:1;overflow-x:auto;scrollbar-width:thin}",
    ".ll-route-matrix__link{display:inline-flex;align-items:center;white-space:nowrap;padding:8px 10px;border:1px solid transparent;border-radius:10px;color:#d9dfeb;text-decoration:none}",
    ".ll-route-matrix__link:hover,.ll-route-matrix__link:focus-visible{background:#171d2a;border-color:#38445a;color:#fff;outline:2px solid transparent}",
    ".ll-route-matrix__link[aria-current=page]{background:#262313;border-color:#9c7c31;color:#ffe6a1}",
    ".ll-route-matrix__menu{display:none;border:1px solid #3a4355;border-radius:10px;padding:8px 12px;background:#111724;color:#fff}",
    "@media(max-width:760px){.ll-route-matrix__inner{align-items:flex-start;flex-wrap:wrap;gap:8px}.ll-route-matrix__brand{padding:8px 0}.ll-route-matrix__menu{display:inline-flex;margin-left:auto}.ll-route-matrix__links{flex-basis:100%;flex-wrap:wrap;display:none;overflow:visible}.ll-route-matrix[data-open=true] .ll-route-matrix__links{display:flex}.ll-route-matrix__link{padding:8px 9px}}",
    "@media(prefers-reduced-motion:reduce){.ll-route-matrix *{scroll-behavior:auto!important;transition:none!important}}"
  ].join("\\n");
  function init() {
    if (!document.body || document.querySelector("[data-lingo-route-matrix]")) return;
    if (!document.getElementById("ll-route-matrix-style")) {
      const style = document.createElement("style"); style.id = "ll-route-matrix-style"; style.textContent = css; document.head.appendChild(style);
    }
    const nav = document.createElement("nav");
    nav.className = "ll-route-matrix"; nav.dataset.lingoRouteMatrix = "true";
    nav.setAttribute("aria-label", "The Lingo Legacy site navigation");
    const inner = document.createElement("div"); inner.className = "ll-route-matrix__inner";
    const brand = document.createElement("a"); brand.className = "ll-route-matrix__brand"; brand.href = "/"; brand.textContent = "LINGO LEGACY";
    const toggle = document.createElement("button"); toggle.className = "ll-route-matrix__menu"; toggle.type = "button"; toggle.textContent = "Menu"; toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-controls", "ll-route-matrix-links");
    const links = document.createElement("div"); links.className = "ll-route-matrix__links"; links.id = "ll-route-matrix-links";
    const current = (location.pathname.replace(/\\/$/, "") || "/").toLowerCase();
    for (const [route,label,group] of ROUTES) {
      const a = document.createElement("a"); a.className = "ll-route-matrix__link"; a.href = route; a.textContent = label; a.dataset.routeGroup = group;
      const target = route.replace(/\\/$/, "") || "/";
      if (current === target || (target !== "/" && current.startsWith(target + "/"))) a.setAttribute("aria-current", "page");
      links.appendChild(a);
    }
    toggle.addEventListener("click", () => {
      const open = nav.dataset.open !== "true"; nav.dataset.open = String(open); toggle.setAttribute("aria-expanded", String(open));
    });
    inner.append(brand, toggle, links); nav.appendChild(inner);
    const existingHeader = document.querySelector("body > header, body > .site-header, body > .header");
    if (existingHeader) existingHeader.insertAdjacentElement("afterend", nav);
    else document.body.insertBefore(nav, document.body.firstChild);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();