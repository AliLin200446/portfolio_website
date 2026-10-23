/** Register during a page's mount effect; resolve after its first usable frame.
 * Rejections also settle readiness so unavailable WebGL cannot trap the loader. */
let total = 0;
let completed = 0;
const listeners = new Set<() => void>();
export function registerLoaderTask(task: Promise<unknown>) {
  total++;
  listeners.forEach(listener => listener());
  const settle = () => {
    completed++;
    listeners.forEach(listener => listener());
  };
  void task.then(settle, settle);
}
export function loaderTasks() { return { total, completed }; }
export function subscribeLoaderTasks(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
