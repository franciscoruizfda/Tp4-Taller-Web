export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function filename(name: string) {
  return name.replace(/[^\p{L}\p{N}_-]/gu, '-').slice(0, 60) || 'beatmind';
}
