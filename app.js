const canvas = document.getElementById("circuitCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const nodes = [];
const connections = [];
const chip = { x: 0, y: 0, w: 180, h: 120 };

function initCircuit() {
  const rect = canvas.getBoundingClientRect();
  chip.x = rect.width / 2 - chip.w / 2;
  chip.y = rect.height / 2 - chip.h / 2;

  nodes.length = 0;
  connections.length = 0;

  const ringRadius = Math.min(rect.width, rect.height) * 0.38;
  const count = 18;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = rect.width / 2 + Math.cos(angle) * ringRadius;
    const y = rect.height / 2 + Math.sin(angle) * ringRadius;
    nodes.push({ x, y, angle, phase: Math.random() * Math.PI * 2 });
  }

  nodes.forEach((n, i) => {
    const edgeX = chip.x + chip.w / 2 + Math.cos(n.angle) * (chip.w / 2);
    const edgeY = chip.y + chip.h / 2 + Math.sin(n.angle) * (chip.h / 2);

    connections.push({
      from: { x: edgeX, y: edgeY },
      to: { x: n.x, y: n.y },
      phase: Math.random() * Math.PI * 2
    });

    if (i % 3 === 0) {
      const j = (i + 5) % nodes.length;
      connections.push({
        from: { x: n.x, y: n.y },
        to: { x: nodes[j].x, y: nodes[j].y },
        phase: Math.random() * Math.PI * 2
      });
    }
  });
}

initCircuit();
window.addEventListener("resize", initCircuit);

let t = 0;

function draw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  const bgGrad = ctx.createRadialGradient(
    rect.width / 2, rect.height / 2, 0,
    rect.width / 2, rect.height / 2, rect.width * 0.7
  );
  bgGrad.addColorStop(0, "rgba(10, 40, 80, 0.4)");
  bgGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, rect.width, rect.height);

  connections.forEach((c, idx) => {
    const pulse = 0.4 + 0.6 * Math.sin(t * 0.03 + c.phase);
    const width = 1 + 1.5 * pulse;
    const alpha = 0.25 + 0.4 * pulse;

    const grad = ctx.createLinearGradient(c.from.x, c.from.y, c.to.x, c.to.y);
    grad.addColorStop(0, `rgba(58, 242, 255, ${alpha})`);
    grad.addColorStop(1, `rgba(123, 92, 255, ${alpha * 0.8})`);

    ctx.lineWidth = width;
    ctx.strokeStyle = grad;

    const midX = (c.from.x + c.to.x) / 2;
    const midY = (c.from.y + c.to.y) / 2;
    const normal = { x: -(c.to.y - c.from.y), y: c.to.x - c.from.x };
    const len = Math.hypot(normal.x, normal.y) || 1;
    const offset = 12 * Math.sin(t * 0.02 + idx);
    const ctrlX = midX + (normal.x / len) * offset;
    const ctrlY = midY + (normal.y / len) * offset;

    ctx.beginPath();
    ctx.moveTo(c.from.x, c.from.y);
    ctx.quadraticCurveTo(ctrlX, ctrlY, c.to.x, c.to.y);
    ctx.stroke();
  });

  nodes.forEach((n) => {
    const pulse = 0.4 + 0.6 * Math.sin(t * 0.05 + n.phase);
    const r = 3 + 2 * pulse;
    ctx.beginPath();
    ctx.fillStyle = `rgba(58, 242, 255, ${0.4 + 0.4 * pulse})`;
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  const chipGrad = ctx.createLinearGradient(chip.x, chip.y, chip.x + chip.w, chip.y + chip.h);
  chipGrad.addColorStop(0, "rgba(10, 30, 60, 0.95)");
  chipGrad.addColorStop(1, "rgba(5, 10, 25, 0.98)");

  ctx.fillStyle = chipGrad;
  ctx.strokeStyle = "rgba(58, 242, 255, 0.7)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(chip.x, chip.y, chip.w, chip.h, 10);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(chip.x + 8, chip.y + 8, chip.w - 16, chip.h - 16, 6);
  ctx.stroke();

  const pinCount = 10;
  for (let i = 0; i < pinCount; i++) {
    const offset = ((i + 0.5) / pinCount) * chip.w;
    const pulse = 0.4 + 0.6 * Math.sin(t * 0.04 + i);
    const alpha = 0.4 + 0.4 * pulse;

    ctx.strokeStyle = `rgba(58, 242, 255, ${alpha})`;

    ctx.beginPath();
    ctx.moveTo(chip.x + offset, chip.y);
    ctx.lineTo(chip.x + offset, chip.y - 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(chip.x + offset, chip.y + chip.h);
    ctx.lineTo(chip.x + offset, chip.y + chip.h + 10);
    ctx.stroke();

    const offsetY = ((i + 0.5) / pinCount) * chip.h;
    ctx.beginPath();
    ctx.moveTo(chip.x, chip.y + offsetY);
    ctx.lineTo(chip.x - 10, chip.y + offsetY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(chip.x + chip.w, chip.y + offsetY);
    ctx.lineTo(chip.x + chip.w + 10, chip.y + offsetY);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(230, 243, 255, 0.9)";
  ctx.font = "11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("CORE QCM-7X", chip.x + chip.w / 2, chip.y + chip.h / 2 - 4);

  ctx.fillStyle = "rgba(127, 155, 191, 0.9)";
  ctx.font = "9px system-ui";
  ctx.fillText("L3 ROUTING · LOGIC VIEW", chip.x + chip.w / 2, chip.y + chip.h / 2 + 12);

  t += 1;
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
