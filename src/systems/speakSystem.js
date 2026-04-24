export async function beginRecordingSession() {
  if (navigator.mediaDevices?.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return { stream, startedAt: Date.now() };
    } catch (error) {
      return { stream: null, startedAt: Date.now(), fallback: true };
    }
  }

  return { stream: null, startedAt: Date.now(), fallback: true };
}

export function finishRecordingSession(session) {
  if (session?.stream) {
    session.stream.getTracks().forEach((track) => track.stop());
  }
  return {
    seconds: Math.max(1, Math.round((Date.now() - (session?.startedAt ?? Date.now())) / 1000)),
  };
}
