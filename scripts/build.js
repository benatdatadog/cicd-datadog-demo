const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname, '..', 'build')
fs.mkdirSync(buildDir, { recursive: true })

const content = `Build ${process.env.BUILD_NUMBER || 'local'} at ${new Date().toISOString()}\n`
fs.writeFileSync(path.join(buildDir, 'artifact.txt'), content, 'utf8')

// eslint-disable-next-line no-console
console.log('Build output written to build/artifact.txt')

