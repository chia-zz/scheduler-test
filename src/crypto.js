// Client-side password gate.
// NOTE: This is NOT real security. GitHub Pages serves the JS publicly, so a
// determined person can bypass it. It only keeps casual outsiders from peeking.
export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
