import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { build } from 'esbuild'
import { Topic } from '@ethersphere/bee-js'

const topicHex = Topic.fromString('stillhere.latest.v1').toHex().replace(/^0x/, '')
const { outputFiles } = await build({
  entryPoints: ['src/reader-entry.js'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2022'],
  minify: true,
  legalComments: 'none',
  write: false,
})
const bundle = outputFiles[0].text.replace(/<\/script/gi, '<\\/script')
const template = await readFile('src/reader.html', 'utf8')
const html = template
  .replace('__FEED_TOPIC__', topicHex)
  .replace('<script type="module" src="./reader-entry.js"></script>', () => `<script>${bundle}</script>`)

await mkdir('public', { recursive: true })
await writeFile('public/reader.html', html)
