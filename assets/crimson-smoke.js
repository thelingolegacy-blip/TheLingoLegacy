/* Optional ambient UI sound: opt-in only; no autoplay and no external audio requests. */
(()=> {
 const init=()=>{
  if(document.querySelector('.ll-audio-toggle')) return;
  const btn=document.createElement('button');
  btn.className='ll-audio-toggle';btn.type='button';btn.setAttribute('aria-pressed','false');
  btn.setAttribute('aria-label','Enable ambient interface sound');
  btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg><span>Sound off</span>';
  const note=document.createElement('div');note.className='ll-audio-note';note.setAttribute('role','status');note.textContent='Ambient sound is generated locally and only plays while enabled.';
  document.body.append(btn,note);
  let ctx=null,osc=null,gain=null;
  const stop=()=>{try{if(gain){gain.gain.setTargetAtTime(0,ctx.currentTime,.08)}if(osc){osc.stop(ctx.currentTime+.25)}}catch{}osc=null;gain=null};
  btn.addEventListener('click',async()=>{
   const active=btn.getAttribute('aria-pressed')==='true';
   if(active){stop();btn.setAttribute('aria-pressed','false');btn.setAttribute('aria-label','Enable ambient interface sound');btn.querySelector('span').textContent='Sound off';note.dataset.visible='false';return}
   try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('Audio is not supported in this browser.');
    ctx=ctx||new AC();await ctx.resume();osc=ctx.createOscillator();gain=ctx.createGain();
    osc.type='sine';osc.frequency.value=55;gain.gain.value=.00001;osc.connect(gain);gain.connect(ctx.destination);osc.start();gain.gain.setTargetAtTime(.012,ctx.currentTime,.8);
    btn.setAttribute('aria-pressed','true');btn.setAttribute('aria-label','Disable ambient interface sound');btn.querySelector('span').textContent='Sound on';note.dataset.visible='true';
   }catch(e){note.textContent=e.message||'Sound unavailable on this device.';note.dataset.visible='true'}
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
