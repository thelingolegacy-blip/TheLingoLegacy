// Simple state (localStorage-backed)
const C = {
  ADS_DAILY_LIMIT: 5,
  COINS_PER_AD: 10,
  COINS_DAILY_CHALLENGE: 50,
  COINS_WEEKLY: 300,
  REFERRER_REWARD: 200,
  REFEREE_REWARD: 100,
  FUND_TARGET: 500000,
  P1: 50000,
  P2: 150000,
  P3: 200000,
  P4: 100000,
  CHALLENGE_TIME: 10
};

const UI = {
  coins: document.getElementById('coins'),
  adsToday: document.getElementById('adsToday'),
  ADS_DAILY_LIMIT: document.getElementById('ADS_DAILY_LIMIT'),
  streakDays: document.getElementById('streakDays'),
  fundBar: document.getElementById('fundProgressBar'),
  fundRaised: document.getElementById('fundRaised'),
  fundBar2: document.getElementById('fundProgressBar2'),
  fundRaised2: document.getElementById('fundRaised2'),
  p1: document.getElementById('p1'),
  p2: document.getElementById('p2'),
  p3: document.getElementById('p3'),
  p4: document.getElementById('p4'),
  username: document.getElementById('username'),
  activity: document.getElementById('activity'),
  btnClaimDailyAd: document.getElementById('btnClaimDailyAd'),
  btnClaimDailyChallenge: document.getElementById('btnClaimDailyChallenge'),
  btnClaimWeekly: document.getElementById('btnClaimWeekly'),
  myReferral: document.getElementById('myReferral'),
  friendCode: document.getElementById('friendCode'),
  refMsg: document.getElementById('refMsg'),
  referrerReward: document.getElementById('referrerReward'),
  refereeReward: document.getElementById('refereeReward')
};

UI.ADS_DAILY_LIMIT.textContent = C.ADS_DAILY_LIMIT;
UI.referrerReward.textContent = C.REFERRER_REWARD;
UI.refereeReward.textContent = C.REFEREE_REWARD;

const phrases = [
  { text: "C’est la vie", options: ["Such is life", "Go faster", "Be quiet", "See you later"], answer: 0 },
  { text: "Pura vida", options: ["Pure life", "Bad idea", "I won", "Hurry up"], answer: 0 },
  { text: "Yalla", options: ["Let’s go", "Be careful", "Thank you", "Tomorrow"], answer: 0 },
  { text: "No wahala", options: ["No problem", "Too expensive", "Good morning", "Hurry"], answer: 0 },
  { text: "Kia ora", options: ["Be well", "Sorry", "I’m tired", "Come here"], answer: 0 }
];

function defaultState() {
  const today = new Date().toISOString().slice(0,10);
  return {
    username: "Guest", coins: 0, adsToday: 0, lastAdDate: today,
    dailyAdClaimed: false, dailyChallengeClaimed: false, weeklyClaimed: false,
    streakDays: 0, lastLoginDate: today, fundRaised: 0,
    referrals: { myCode: "", codeApplied: false, referrerCodeUsed: "", refereeFirstDailyComplete: false, referrerPaid: false },
    activity: []
  };
}

function loadState() {
  const raw = localStorage.getItem("lingo_demo_state");
  if(!raw) return defaultState();
  try {
    const s = JSON.parse(raw);
    const today = new Date().toISOString().slice(0,10);
    if (s.lastAdDate !== today) {
      s.adsToday = 0; s.dailyAdClaimed = false; s.dailyChallengeClaimed = false; s.lastAdDate = today;
    }
    if (s.lastLoginDate !== today) {
      const last = new Date(s.lastLoginDate), t = new Date(today);
      const diff = (t - last)/(1000*3600*24);
      s.streakDays = (diff === 1) ? (s.streakDays+1) : 1;
      s.lastLoginDate = today; s.weeklyClaimed = false;
    }
    return s;
  } catch(e) { return defaultState(); }
}

let S = loadState();
function save() { localStorage.setItem("lingo_demo_state", JSON.stringify(S)); }
function addActivity(msg) {
  S.activity.unshift({ t: new Date().toLocaleString(), msg });
  if (S.activity.length>50) S.activity.pop();
}
function render() {
  UI.coins.textContent = S.coins; UI.adsToday.textContent = S.adsToday;
  UI.streakDays.textContent = S.streakDays; UI.username.textContent = S.username;
  const pct = Math.min(100, (S.fundRaised/C.FUND_TARGET)*100);
  UI.fundBar.style.width = pct+"%"; UI.fundRaised.textContent = "$"+S.fundRaised.toLocaleString();
  UI.fundBar2.style.width = pct+"%"; UI.fundRaised2.textContent = "$"+S.fundRaised.toLocaleString();
  UI.p1.style.width = Math.min(100, (S.fundRaised/C.P1)*100) + "%";
  UI.p2.style.width = Math.min(100, (Math.max(0,S.fundRaised-C.P1)/C.P2)*100) + "%";
  UI.p3.style.width = Math.min(100, (Math.max(0,S.fundRaised-(C.P1+C.P2))/C.P3)*100) + "%";
  UI.p4.style.width = Math.min(100, (Math.max(0,S.fundRaised-(C.P1+C.P2+C.P3))/C.P4)*100) + "%";
  UI.myReferral.textContent = S.referrals.myCode || "—";
  UI.activity.innerHTML = S.activity.map(a => `<li><b>${a.t}</b><br>${a.msg}</li>`).join("");
  save();
}

document.querySelectorAll('nav button, [data-screen]').forEach(btn => btn.addEventListener('click', () => {
  const target = btn.getAttribute('data-screen'); if(!target) return;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(target).classList.add('active');
}));

document.getElementById('btnWatchAd').addEventListener('click', () => {
  if (S.adsToday >= C.ADS_DAILY_LIMIT) return alert("Daily ad limit reached.");
  const btn = document.getElementById('btnWatchAd'), old = btn.textContent; let secs = 5;
  btn.disabled = true;
  const iv = setInterval(() => {
    btn.textContent = `Watching ad… ${secs}s`; secs--;
    if (secs < 0) {
      clearInterval(iv); btn.textContent = old; btn.disabled = false;
      S.adsToday += 1; S.coins += C.COINS_PER_AD; S.fundRaised += 2;
      addActivity(`Watched ad (+${C.COINS_PER_AD} coins). Community +$2.`); render();
    }
  },1000);
});

document.getElementById('btnDailyGoal').addEventListener('click', () => {
  if (!S.dailyChallengeClaimed) {
    S.dailyChallengeClaimed = true; S.coins += C.COINS_DAILY_CHALLENGE; S.fundRaised += 5;
    addActivity(`Daily goal complete (+${C.COINS_DAILY_CHALLENGE} coins). Community +$5.`);
    if (!S.referrals.refereeFirstDailyComplete && S.referrals.codeApplied) {
      S.referrals.refereeFirstDailyComplete = true; S.coins += C.REFEREE_REWARD;
      addActivity(`Referral bonus (referee) +${C.REFEREE_REWARD} coins.`);
      addActivity(`Notify referrer (${S.referrals.referrerCodeUsed}) to award +${C.REFERRER_REWARD} coins.`);
    }
    render();
  } else alert("Daily goal already claimed today.");
});

UI.btnClaimDailyAd.addEventListener('click', () => {
  if (S.dailyAdClaimed) return alert("Already claimed today.");
  if (S.adsToday < 1) return alert("Watch at least 1 ad first.");
  S.dailyAdClaimed = true; S.coins += C.COINS_PER_AD;
  addActivity(`Claimed Daily: Watch 1 Ad (+${C.COINS_PER_AD} coins).`); render();
});
UI.btnClaimDailyChallenge.addEventListener('click', () => {
  if (S.dailyChallengeClaimed) addActivity("Daily challenge already completed today.");
  else addActivity("Complete a Phrase Challenge on the Challenge tab first.");
  render();
});
UI.btnClaimWeekly.addEventListener('click', () => {
  if (S.weeklyClaimed) return alert("Weekly reward already claimed.");
  if (S.streakDays < 7) return alert("Keep your streak to 7 days to claim.");
  S.weeklyClaimed = true; S.coins += C.COINS_WEEKLY;
  addActivity(`Claimed Weekly Streak (+${C.COINS_WEEKLY} coins).`); render();
});

const phraseEl = document.getElementById('phrase'), timerEl = document.getElementById('timer'),
  choicesEl = document.getElementById('choices'), msgEl = document.getElementById('challengeMsg'),
  btnNewRound = document.getElementById('btnNewRound');
let current, timeLeft, tInt = null;
function newRound() {
  current = phrases[Math.floor(Math.random()*phrases.length)]; phraseEl.textContent = current.text; choicesEl.innerHTML = "";
  const shuffled = current.options.map((opt,i)=>({opt,i})).sort(()=>Math.random()-0.5);
  shuffled.forEach(o => { const b=document.createElement('button'); b.textContent=o.opt; b.addEventListener('click',()=>chooseAnswer(o.i)); choicesEl.appendChild(b); });
  msgEl.textContent=""; timeLeft=C.CHALLENGE_TIME; timerEl.textContent=timeLeft;
  if(tInt) clearInterval(tInt);
  tInt=setInterval(()=>{ timeLeft--; timerEl.textContent=timeLeft; if(timeLeft<=0){clearInterval(tInt);msgEl.textContent="⛔ Time’s up! Try another round.";} },1000);
}
btnNewRound.addEventListener('click',newRound);
function chooseAnswer(i) {
  clearInterval(tInt);
  if(i===current.answer){ msgEl.textContent="✅ Correct! +25 coins (demo)"; S.coins+=25; S.dailyChallengeClaimed=true; S.fundRaised+=3; addActivity("Phrase Challenge win (+25 coins). Community +$3."); }
  else msgEl.textContent="❌ Not quite. Try again!";
  render();
}

document.getElementById('btnNewCode').addEventListener('click',()=>{ const code="LINGO-"+Math.floor(1000+Math.random()*9000); S.referrals.myCode=code; addActivity(`Generated referral code: ${code}`); render(); });
document.getElementById('btnApplyCode').addEventListener('click',()=>{
  if(S.referrals.codeApplied){UI.refMsg.textContent="You already applied a code on this account.";return;}
  const code=UI.friendCode.value.trim().toUpperCase();
  if(!code||!code.startsWith("LINGO-")||code.length<10){UI.refMsg.textContent="Enter a valid code (e.g., LINGO-1234).";return;}
  S.referrals.codeApplied=true; S.referrals.referrerCodeUsed=code;
  UI.refMsg.textContent="Code applied! Complete your first daily goal to trigger both rewards.";
  addActivity(`Applied referral code ${code}.`); render();
});
document.getElementById('btnReset').addEventListener('click',()=>{localStorage.removeItem("lingo_demo_state");S=defaultState();addActivity("Reset demo state.");render();});
render(); newRound();
