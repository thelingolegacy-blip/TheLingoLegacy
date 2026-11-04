/* LINGO Studio Surface Adapter v1.0.0
   Shared navigation, runtime diagnostics, and state-aware UI helpers. */
(function(){
  "use strict";
  const Runtime=window.LingoStudioRuntime||{};
  const surface=document.body?.dataset.lingoSurface||"unknown";

  function state(value){
    if(document.body) document.body.dataset.studioState=value;
    document.documentElement.dataset.studioState=value;
  }

  function nav(){
    if(document.querySelector("[data-studio-nav]")) return;
    if(document.querySelector("header nav, .topbar nav, [data-primary-nav]")) return;
    const items=[
      ["/studio-hub/","Hub"],["/studio-sites/lingoarcade/","LINGOarcade"],
      ["/studio-sites/lingoslots/","LINGOslots"],["/thats-my-lingo/","That’s My Lingo"],
      ["/kottons-code/","KottonsCode"],["/loyalty-lane-apparel/","LINGOlane"],
      ["/media/","LINGOmedia"],["/lingo-ai/","askLINGO"]
    ];
    const nav=document.createElement("nav");
    nav.dataset.studioNav="";
    nav.className="studio-surface-nav";
    nav.setAttribute("aria-label","Lingo Studio navigation");
    nav.innerHTML=items.map(([href,label])=>'<a class="button" href="'+href+'">'+label+"</a>").join("");
    document.body.prepend(nav);
  }

  function diagnostics(){
    window.LingoStudioSurface={
      version:"1.0.0",
      surface,
      runtimeVersion:Runtime.version||null,
      reducedMotion:!!Runtime.reducedMotion,
      state:document.body?.dataset.studioState||"UNKNOWN",
      audioPreference:localStorage.getItem("lingo-studio-audio")||"off"
    };
  }

  function init(){
    nav();
    diagnostics();
    if(!document.body?.dataset.studioState) state("READY");
    diagnostics();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();