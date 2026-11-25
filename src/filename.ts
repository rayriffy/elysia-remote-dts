export function filenameTsToDts(id: string): string {
  return id.replace(/\.([cm]?)[jt]sx?$/, '.d.$1ts')
}
