/** Friendly note for anyone who opens the developer console. Printed once. */
export function greetTheCurious(): void {
  if (typeof console === 'undefined') return
  const label = 'font-family: ui-monospace, monospace; color: #A3E635; font-weight: 600;'
  const body = 'font-family: ui-monospace, monospace; color: #8993A4;'
  console.log('%c● SYSTEM ONLINE', label)
  console.log('%cCurious, are we? Good. That’s usually where things start.', body)
  console.log(
    '%cThe game lives in src/game. The best score lives in localStorage. The Konami code lives in your muscle memory.',
    body,
  )
}
