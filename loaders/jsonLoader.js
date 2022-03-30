export default function (source) {
  console.log('@@@@@@@@@ loader')
  return `export default ${JSON.stringify(source)}`
}