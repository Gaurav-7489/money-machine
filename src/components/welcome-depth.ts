import { Euler } from "three/src/math/Euler.js";
import { Matrix4 } from "three/src/math/Matrix4.js";

/** Three.js composes the 3D rotation. CSS renders the HTML cards in depth. */
export function connectDepth(stage: HTMLElement, stack: HTMLElement, preference: MediaQueryList, initialPointer: PointerEvent) {
  const rotation = new Euler();
  const matrix = new Matrix4();
  let targetX = 0;
  let targetY = 0;
  let frame: number | undefined;

  function tick() {
    frame = undefined;
    const dx = targetX - rotation.x;
    const dy = targetY - rotation.y;
    if (Math.abs(dx) + Math.abs(dy) < 0.0005) {
      rotation.set(targetX, targetY, 0);
    } else {
      rotation.x += dx * 0.2;
      rotation.y += dy * 0.2;
      frame = requestAnimationFrame(tick);
    }
    matrix.makeRotationFromEuler(rotation);
    stack.style.transform = `matrix3d(${matrix.elements.join(",")})`;
  }

  function update(x: number, y: number) {
    targetX = x;
    targetY = y;
    if (frame === undefined) frame = requestAnimationFrame(tick);
  }

  function move(event: PointerEvent) {
    if (!preference.matches || event.pointerType !== "mouse") return;
    const bounds = stage.getBoundingClientRect();
    update((0.5 - (event.clientY - bounds.top) / bounds.height) * 0.14, ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.2);
  }

  function leave() {
    if (preference.matches) update(0, 0);
  }

  function reset() {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    targetX = targetY = 0;
    rotation.set(0, 0, 0);
    stack.style.removeProperty("transform");
  }

  if (stage.matches(":hover")) move(initialPointer);
  stage.addEventListener("pointermove", move, { passive: true });
  stage.addEventListener("pointerleave", leave);
  preference.addEventListener("change", reset);
  return () => {
    stage.removeEventListener("pointermove", move);
    stage.removeEventListener("pointerleave", leave);
    preference.removeEventListener("change", reset);
    reset();
  };
}
