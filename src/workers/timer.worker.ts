let intervalId: ReturnType<typeof setInterval> | null = null;
let remaining = 0;
let counting: "down" | "up" = "down";

function tick() {
  if (counting === "down") {
    remaining--;
    if (remaining <= 0) {
      remaining = 0;
      self.postMessage({ type: "tick", remaining: 0 });
      self.postMessage({ type: "complete" });
      stop();
      return;
    }
  } else {
    remaining++;
  }
  self.postMessage({ type: "tick", remaining });
}

function stop() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

self.onmessage = (e: MessageEvent) => {
  const { command, duration, direction } = e.data;

  switch (command) {
    case "start":
      stop();
      remaining = duration;
      counting = direction === "up" ? "up" : "down";
      self.postMessage({ type: "tick", remaining });
      intervalId = setInterval(tick, 1000);
      break;

    case "pause":
      stop();
      break;

    case "resume":
      if (intervalId === null) {
        intervalId = setInterval(tick, 1000);
      }
      break;

    case "stop":
      stop();
      remaining = 0;
      break;
  }
};
