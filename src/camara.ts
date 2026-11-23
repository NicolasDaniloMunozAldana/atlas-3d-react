// Sesión 36 (espejo de la 24) — cámara del dispositivo como fondo vivo del visor.
// Permisos, constraints y errores de getUserMedia ya se vieron en la Sesión 24; aquí cambia la
// DURACIÓN: el flujo queda abierto mientras se usa el visor, así que hay que apagarlo a tiempo.

export async function iniciarCamaraDeFondo(video: HTMLVideoElement): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  return stream;
}

export function detenerCamaraDeFondo(video: HTMLVideoElement, stream: MediaStream | null): void {
  stream?.getTracks().forEach((pista) => pista.stop());
  video.srcObject = null;
}

/** Traduce el error de getUserMedia a un mensaje que dice qué pasó y qué hacer. */
export function describirErrorCamara(err: unknown): string {
  const nombre = err instanceof Error ? err.name : "";
  switch (nombre) {
    case "NotAllowedError":
      return "Bloqueaste el permiso de cámara. El visor sigue funcionando sin ella.";
    case "NotFoundError":
      return "No se encontró ninguna cámara en este dispositivo.";
    case "NotReadableError":
      return "La cámara está en uso por otra aplicación. Ciérrala e inténtalo de nuevo.";
    case "SecurityError":
      return "El navegador tiene deshabilitado el acceso a la cámara en esta página.";
    case "TypeError":
      // En HTTP navigator.mediaDevices es undefined: lo que se lanza es TypeError, no SecurityError.
      return "La cámara solo está disponible en páginas seguras (HTTPS o localhost).";
    default:
      return "No se pudo abrir la cámara. Revisa los permisos e inténtalo de nuevo.";
  }
}
