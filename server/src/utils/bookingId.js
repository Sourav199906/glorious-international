export function bookingId() {
  return `GI-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
}
