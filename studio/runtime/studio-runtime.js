/* LINGO Studio Runtime v1
   Shared bootstrap: loading, media, motion, audio preference, runtime states. */
(function(){
  "use strict";

  const KEY="lingo-studio-audio";
  const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(){
    setState("READY");
    const boot=document.querySelector(".studio-boot");
    if(boot){ boot.dataset.ready="true"; setTimeout(()=>boot.remove(),500); }
    document.documentElement.dataset.studioReady="true";
  }

  function setupMedia(){
    document.querySelectorAll("img[data-studio-src],video[data-studio-src]").forEach(el=>{
      if(!el.getAttribute("src")) el.setAttribute("src",el.dataset.studioSrc);
      el.classList.add("studio-media");
      if(!el.hasAttribute("loading") && el.tagName==="IMG") el.loading="lazy";
      el.addEventListener("error",()=>{el.dataset.mediaState="error";});
    });
  }

  function setupAudio(){
    const audio=document.querySelectorAll("audio");
    const stored=localStorage.getItem(KEY);
    const muted=stored!=="on";
    audio.forEach(a=>{a.muted=muted;a.addEventListener("error",()=>{a.dataset.audioState="error";});});
    const control=document.querySelector("[data-studio-audio]");
    if(control){
      control.setAttribute("aria-pressed",muted?"false":"true");
      control.textContent=muted?"Sound Off":"Sound On";
      control.onclick=()=>{
        const next=!Array.from(audio).some(a=>!a.muted);
        audio.forEach(a=>a.muted=next);
        localStorage.setItem(KEY,next?"off":"on");
        control.setAttribute("aria-pressed",next?"false":"true");
        control.textContent=next?"Sound Off":"Sound On";
      };
    }
  }

  function setupMotion(){
    if(reduced) document.documentElement.dataset.reducedMotion="true";
    document.querySelectorAll("[data-studio-motion]").forEach(el=>{
      el.classList.add("studio-motion");
      if(reduced) el.dataset.motionDisabled="true";
    });
  }

  function init(){
    setState("LOADING");
    ensureBoot();
    ensureAudioControl();
    try {
      setupMedia();
      setupAudio();
      setupMotion();
      requestAnimationFrame(ready);
    } catch(error) {
      setState("ERROR");
      const label=document.querySelector(".studio-state");
      if(label) label.textContent="Studio runtime error";
      window.LingoStudioRuntimeError=String(error&&error.message||error);
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();

  window.LingoStudioRuntime={version:"1.0.0",reducedMotion:reduced};
})();