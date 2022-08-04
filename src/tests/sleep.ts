export function sleepFor(sleepDuration: number) {
  const now = new Date().getTime();
  let time = new Date().getTime();
  while (time < now + sleepDuration) {
    time = new Date().getTime();
  }
}
