/* LINGO Studio Runtime v1
   Shared bootstrap: loading, media, motion, audio preference, runtime states. */
(function(){
  "use strict";

  const KEY="lingo-studio-audio";
  const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setState(state){
    if(document.body) document.body.dataset.studioState=state;
    document.documentElement.dataset.studioState=state;
    const label=document.querySelector(".studio-state");
    if(label) label.textContent=state;
  }

  function ensureBoot(){
    if(document.querySelector(".studio-boot")) return;
    const boot=document.createElement("div");
    boot.className="studio-boot";
    boot.setAttribute("role","status");
    boot.setAttribute("aria-live","polite");
    boot.innerHTML='<div class="studio-boot__mark" aria-hidden="true">LINGO</div><div class="studio-progress" aria-hidden="true"><span></span></div><div class="studio-state">LOADING</div>';
    document.body?.prepend(boot);
  }

  function ensureAudioControl(){
    if(document.querySelector("[data-studio-audio]")) return;
    const control=document.createElement("button");
    control.type="button";
    control.className="studio-audio-control";
    control.dataset.studioAudio="";
    control.setAttribute("aria-label","Toggle studio sound");
    control.textContent="Sound Off";
    document.body?.append(control);
  }

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
    try {
      ensureBoot();
      ensureAudioControl();
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