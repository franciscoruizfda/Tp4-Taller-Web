import { useSyncExternalStore } from 'react';

// The way on to Núcleo 3 opens only once the visitor has made a beat and downloaded it as audio.
// It lasts for this tab (sessionStorage): a new tab, a new beat or the end of the infographic
// start locked again, so each visitor at the shared screen has to create their own.
const KEY = 'beatmind-nucleo3-v1';
const oyentes = new Set<() => void>();

function leer() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

let abierto = leer();

function cambiar(valor: boolean) {
  abierto = valor;
  try {
    if (valor) sessionStorage.setItem(KEY, '1');
    else sessionStorage.removeItem(KEY);
  } catch {
    /* Private mode: the lock still works for this visit. */
  }
  oyentes.forEach((avisar) => avisar());
}

export const desbloquearNucleo3 = () => cambiar(true);
export const bloquearNucleo3 = () => cambiar(false);

export function useNucleo3Abierto() {
  return useSyncExternalStore(
    (avisar) => {
      oyentes.add(avisar);
      return () => oyentes.delete(avisar);
    },
    () => abierto,
  );
}
