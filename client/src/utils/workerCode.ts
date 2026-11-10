export const SHARK_WORKER_CODE = `
  let isRunning = false;
  let x = Math.random() * 50 + 10;
  let y = 30;
  let baseY = 30;
  let speed = 1.6 + Math.random() * 2.2;
  let direction = Math.random() > 0.5 ? 1 : -1;
  let verticalSpeed = 0.3;
  let timer = null;

  self.onmessage = function(e) {
    const { action } = e.data;
    if (action === 'START') {
      if (!isRunning) {
        isRunning = true;
        loop();
      }
    } else if (action === 'INIT') {
      baseY = e.data.initialY || 30;
      y = baseY;
      x = e.data.initialX || 10;
    } else if (action === 'PAUSE') {
      isRunning = false;
      if (timer) clearTimeout(timer);
    } else if (action === 'RESET') {
      isRunning = false;
      if (timer) clearTimeout(timer);
      x = e.data.initialX || 10;
      y = baseY;
      speed = 1.6 + Math.random() * 2;
      direction = 1;
      self.postMessage({ x, y, speed, direction: 'right' });
    }
  };

  function loop() {
    if (!isRunning) return;

    const delta = (Math.random() - 0.5) * 0.4;
    speed = Math.max(0.8, Math.min(6.2, speed + delta));
    x += speed * direction * 0.35;

    y += verticalSpeed;
    if (y > baseY + 12 || y < baseY - 12 || y > 82 || y < 14) {
      verticalSpeed *= -1;
    }

    if (x >= 88) {
      x = 88;
      direction = -1;
    } else if (x <= 2) {
      x = 2;
      direction = 1;
    }

    self.postMessage({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      speed: Number(speed.toFixed(2)),
      direction: direction === 1 ? 'right' : 'left'
    });

    timer = setTimeout(loop, 20);
  }
`;
