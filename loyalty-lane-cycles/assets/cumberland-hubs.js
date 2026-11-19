(function(){
  const root=document.querySelector('[data-llc-regional-hubs]');
  if(!root)return;
  const escapeHtml=(value)=>String(value??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const maps=(address)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address);
  async function load(){
    try{
      const response=await fetch('/api/v1/loyalty-lane-cycles/hubs',{headers:{Accept:'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error('Regional hub directory is not available yet.');
      const data=await response.json();
      if(!data.ok||!Array.isArray(data.cities))throw new Error('Regional hub data is incomplete.');
      root.innerHTML='<div class="llc-region__meta"><span class="llc-region__pill">'+escapeHtml(data.targetHubCount)+' planned hubs</span><span class="llc-region__pill">3 cities</span><span class="llc-region__pill">24/7 target</span><span class="llc-region__pill">Partner status: pending</span></div><div class="llc-region__cities">'+data.cities.map(city=>'<section class="llc-city"><h3>'+escapeHtml(city.city)+' · '+escapeHtml(city.hubs.length)+' hubs</h3>'+city.hubs.map(hub=>'<article class="llc-hub"><strong>'+escapeHtml(hub.name)+'</strong><small>'+escapeHtml(hub.address)+'</small><small>Currently listed: '+escapeHtml(hub.listedHours||'Hours not verified')+'</small><small>Target: '+escapeHtml(hub.targetHours||'24/7')+'</small><span class="llc-hub__status">Candidate only · agreement not confirmed</span><small><a href="'+maps(hub.address)+'" target="_blank" rel="noopener noreferrer">Map this candidate</a>'+(hub.phone?' · <a href="tel:'+escapeHtml(hub.phone)+'">Call listing</a>':'')+'</small></article>').join('')+'</section>').join('')+'</div><p class="llc-region__disclaimer">'+escapeHtml(data.note||'Candidate directory only. Verify all details before travel or activation.')+'</p>';
    }catch(error){root.textContent=error.message||'Unable to load the regional hub directory.';}
  }
  load();
})();
