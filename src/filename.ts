export const regexTypeScriptFile: RegExp = /\.([cm]?)tsx?$/
export const regexNodeModules: RegExp = /[\\/]node_modules[\\/]/

export function filenameTsToDts(id: string): string {
  return id.replace(regexTypeScriptFile, '.d.$1ts')
}
