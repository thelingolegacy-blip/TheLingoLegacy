(()=>{'use strict';if(!('serviceWorker'in navigator))return;window.addEventListener('load',()=>navigator.serviceWorker.register('/studio-sites/sw.js',{scope:'/studio-sites/'}).catch(()=>{}))})();
