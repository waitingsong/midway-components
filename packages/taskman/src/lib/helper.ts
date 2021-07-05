
export const taskRunningState = {
  count: 0,
}

export function increaseRunningTaskCount(): void {
  if (taskRunningState.count < 0) {
    taskRunningState.count = 0
  }
  taskRunningState.count += 1
}

export function decreaseRunningTaskCount(): void {
  if (taskRunningState.count >= 1) {
    taskRunningState.count -= 1
  }
}
