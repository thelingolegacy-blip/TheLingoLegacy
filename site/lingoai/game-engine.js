const canvas = document.getElementById('lingo-game');
const ctx = canvas.getContext('2d');
const muteToggle = document.getElementById('mute-toggle');
const shareButton = document.getElementById('share-btn');
let soundOn = true;
let score = 0;
let frame = 0;
function sizeCanvas() {
  canvas.width = Math.min(900, canvas.parentElement.clientWidth - 24);
  canvas.height = 420;
}
function draw() {
  frame += 1;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#05080d');
  gradient.addColorStop(1, '#182233');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(215,181,109,.28)';
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  const pulse = Math.sin(frame / 20) * 12;
  ctx.fillStyle = '#d7b56d';
  ctx.font = 'bold 42px Arial';
  ctx.fillText('That’s My Lingo', 34, 78);
  ctx.fillStyle = '#56d8ff';
  ctx.font = '22px Arial';
  ctx.fillText('Prototype game canvas: collect words, earn XP, unlock Crown drops.', 36, 120);
  ctx.fillStyle = '#f2efe6';
  ctx.font = '20px Arial';
  ctx.fillText(`XP Score: ${score}`, 36, 170);
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 + pulse, 54, 0, Math.PI * 2);
  ctx.fillStyle = '#ff6b35';
  ctx.fill();
  ctx.fillStyle = '#06090d';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('LINGO', w / 2, h / 2 + pulse + 8);
  ctx.textAlign = 'left';
  requestAnimationFrame(draw);
}
canvas.addEventListener('click', () => { score += 10; });
muteToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  muteToggle.textContent = `Sound: ${soundOn ? 'On' : 'Muted'}`;
});
shareButton.addEventListener('click', async () => {
  const text = `I scored ${score} XP in Lingo.ai — That’s My Lingo.`;
  if (navigator.share) await navigator.share({ title: 'Lingo.ai', text, url: location.href });
  else navigator.clipboard?.writeText(`${text} ${location.href}`);
});
window.addEventListener('resize', sizeCanvas);
sizeCanvas();
draw();
