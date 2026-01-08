const { sum } = require('./sum')

function main() {
  const result = sum(2, 3)
  // eslint-disable-next-line no-console
  console.log(`Demo app sum(2, 3) = ${result}`)
  return result
}

if (require.main === module) {
  main()
}

module.exports = { main }

