import { Bee, PrivateKey, Topic } from '@ethersphere/bee-js'
import {
  makeFeedPointer,
  makeFeedUrl,
  makePost,
  makeRawPostUrl,
  normalizePrivateKey,
  parseFeedInput,
  readFeedPointer,
  renderParagraphs,
  TOPIC_NAME,
} from './publishing.js'
import './style.css'

const GATEWAY_DEFAULT = 'https://api.gateway.ethswarm.org'
const BEE_DEFAULT = 'http://localhost:1633'
const TOPIC = Topic.fromString(TOPIC_NAME).toHex()
const app = document.querySelector('#app')

app.innerHTML = `
  <div class="shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Stillhere home">
        <svg class="brand-mark" viewBox="0 0 48 48" role="img" aria-label="Stillhere logo">
          <defs><linearGradient id="brand-fill" x1="5" y1="4" x2="43" y2="45" gradientUnits="userSpaceOnUse"><stop stop-color="#4f8063"/><stop offset="1" stop-color="#244b36"/></linearGradient></defs>
          <rect x="2" y="2" width="44" height="44" rx="15" fill="url(#brand-fill)"/>
          <path class="logo-route" d="M12 30.5h8.5c2.8 0 4.5-1.6 4.5-4.1s-1.7-4.1-4.5-4.1h-1c-2.8 0-4.5-1.6-4.5-4.1s1.7-4.1 4.5-4.1H28c2.8 0 4.5 1.6 4.5 4.1v17" fill="none" stroke="#f8f6e8" stroke-width="2.8" stroke-linecap="round"/>
          <circle class="logo-node" cx="32.5" cy="35.2" r="3.6" fill="#d7e89a"/>
        </svg>
        <span class="brand-word">stillhere</span>
      </a>
      <span class="top-note"><span class="status-dot"></span> A small publishing tool for the long link</span>
    </header>
    <main>
      <section class="hero">
        <div class="hero-copy-column">
          <p class="eyebrow"><span class="eyebrow-mark"></span> INDEPENDENT BY DESIGN</p>
          <h1>One link.<br /><span>Always the latest.</span></h1>
          <p class="hero-copy">Your app can go away. Your domain can go away. Keep one link to the latest work—published to Swarm, updated by your feed.</p>
          <div class="hero-foot"><span><i class="hero-check">✓</i> CONTENT ON SWARM</span><span><i class="hero-check">✓</i> LATEST VIA FEED</span><span><i class="hero-check">✓</i> KEY STAYS LOCAL</span></div>
        </div>
        <div class="hero-visual" role="img" aria-label="Illustration of a post flowing through a Swarm feed to a stable reader link">
          <div class="visual-grid"></div>
          <div class="visual-orbit orbit-one"></div><div class="visual-orbit orbit-two"></div>
          <div class="orbit-dot dot-a"></div><div class="orbit-dot dot-b"></div><div class="orbit-dot dot-c"></div>
          <div class="visual-topline"><span class="live-pulse"></span> A LINK THAT KEEPS UP <span class="visual-version">01 / 01</span></div>
          <div class="visual-card post-visual-card">
            <div class="visual-card-head"><span class="visual-icon icon-page">↗</span><span>YOUR NEW POST</span><span class="visual-live">ON SWARM</span></div>
            <div class="visual-lines"><i></i><i></i><i></i></div>
            <div class="visual-card-foot"><span>immutable content</span><span>●</span></div>
          </div>
          <div class="flow-line"><span class="flow-particle"></span></div>
          <div class="feed-node"><span class="feed-node-core"></span><span class="feed-ring ring-a"></span><span class="feed-ring ring-b"></span></div>
          <div class="visual-card link-visual-card">
            <div class="visual-card-head"><span class="visual-icon icon-link">↗</span><span>YOUR READER LINK</span></div>
            <div class="link-preview"><span>●</span><i></i><b>Latest work</b></div>
            <div class="visual-card-foot"><span>same link, new post</span><span class="arrow-nudge">↗</span></div>
          </div>
          <div class="visual-caption"><span class="caption-line"></span> publish → update feed → keep sharing</div>
          <div class="visual-stamp">SWARM <span>·</span> FEED <span>·</span> YOU</div>
        </div>
      </section>

      <section class="workbench" aria-label="Publisher workspace">
        <div class="tabs" role="tablist">
          <button class="tab active" id="publish-tab" role="tab" aria-selected="true" aria-controls="publish-panel" tabindex="0">Publish a post <span>01</span></button>
          <button class="tab" id="read-tab" role="tab" aria-selected="false" aria-controls="read-panel" tabindex="-1">Read a feed <span>02</span></button>
        </div>
        <section class="panel" id="publish-panel" role="tabpanel" aria-labelledby="publish-tab">
          <div class="section-heading">
            <div><p class="eyebrow">PUBLISHER STUDIO</p><h2>Put your latest work out there.</h2></div>
            <span class="step-badge">SWARM FEED · SEQUENCE</span>
          </div>
          <div class="connection-grid">
            <label class="field"><span>Bee endpoint</span><input id="bee-url" type="url" value="${BEE_DEFAULT}" autocomplete="url" spellcheck="false" /><small>A Bee node with browser CORS enabled. Use a trusted node you control.</small></label>
            <label class="field"><span>Postage batch ID</span><span class="secret-field"><input id="stamp" type="password" placeholder="Paste an active batch ID" autocomplete="off" spellcheck="false" /><button class="visibility-button" type="button" data-toggle-secret="stamp" aria-label="Show postage batch ID" title="Show postage batch ID"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span><small>Required for every post, reader page, and feed update. Never enter your private key here.</small></label>
          </div>
          <label class="field gateway-field"><span>Public Swarm gateway for links</span><input id="gateway-url" type="url" value="${GATEWAY_DEFAULT}" autocomplete="url" /><small>The stable link opens a reader page stored on Swarm, not this app's server.</small></label>
          <div class="identity-card">
            <div class="identity-icon">✳</div>
            <div class="identity-copy"><strong>Publisher identity</strong><span id="identity-summary">Create a key in this browser, or enter one you already own.</span></div>
            <button class="button button-outline" id="create-key" type="button">Create key</button>
          </div>
          <label class="field key-field"><span>Private key <b>· stays in this tab</b></span><span class="secret-field"><input id="private-key" type="password" placeholder="0x… or 64 hex characters" autocomplete="off" spellcheck="false" /><button class="visibility-button" type="button" data-toggle-secret="private-key" aria-label="Show private key" title="Show private key"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span><small>Used in-browser to sign feed updates. Not saved in storage, sent to Bee, or logged. Keep a secure backup to continue publishing later.</small></label>
          <div class="identity-detail" id="identity-detail" hidden><span>FEED OWNER</span><code id="publisher-address"></code><button class="text-button" id="copy-address" type="button">Copy address</button><button class="text-button backup-key-button" id="save-key" type="button">Download key backup</button></div>
          <div class="divider"><span>THE POST</span><button class="text-button clear-draft" id="clear-draft" type="button">Clear draft</button></div>
          <div class="post-grid">
            <label class="field"><span>Title</span><input id="post-title" maxlength="160" placeholder="A thought worth keeping" /></label>
            <label class="field"><span>Byline</span><input id="post-author" maxlength="80" placeholder="Your name or publication" /></label>
          </div>
          <label class="field"><span>Post</span><textarea id="post-body" rows="8" maxlength="40000" placeholder="Write an original post. Plain text is preserved; separate paragraphs with a blank line."></textarea><small><span id="char-count">0</span> / 40,000 characters · plain text only</small></label>
          <div class="sample-row"><button class="text-button" id="load-sample" type="button">Load an original demo post</button><span>Fictional example only; it is not published until you choose to publish.</span></div>
          <div class="publish-row">
            <div class="stamp-note"><span class="info-icon">i</span><span><strong>Availability is not forever.</strong> Posts and feed updates depend on valid postage, batch capacity, and Swarm network conditions.</span></div>
            <button class="button button-primary" id="publish-button" type="button">Publish latest <span>↗</span></button>
          </div>
          <div class="publish-progress" id="publish-progress" role="status" aria-live="polite" hidden>
            <span class="progress-spinner" aria-hidden="true"></span><span id="publish-progress-text">Preparing upload…</span>
          </div>
          <div class="notice" id="publish-notice" role="status" aria-live="polite" hidden></div>
          <section class="result-card" id="publish-result" hidden>
            <div class="result-title"><span class="result-check">✓</span><div><strong>Latest post updated</strong><span>Post and reader page are on Swarm; the feed points to the new version.</span></div></div>
            <div class="result-line"><span>POST ON SWARM</span><a id="post-link" target="_blank" rel="noopener noreferrer"></a></div>
            <div class="result-line"><span>STABLE READER LINK</span><a id="share-link" target="_blank" rel="noopener noreferrer"></a></div>
            <div class="result-actions"><button class="button button-outline" id="copy-share" type="button"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>Copy stable link</button><span class="backup-reminder">Keep your key backup private—anyone holding it can update this feed.</span></div>
          </section>
        </section>
        <section class="panel" id="read-panel" role="tabpanel" aria-labelledby="read-tab" hidden>
          <div class="section-heading"><div><p class="eyebrow">READER</p><h2>Follow the latest, not the old address.</h2></div><span class="step-badge">READ ONLY</span></div>
          <p class="reader-intro">Paste a stable Stillhere reader link or enter a publisher address. Stillhere resolves the current feed update, then displays the referenced post.</p>
          <label class="field"><span>Stable reader link or publisher address</span><input id="reader-input" type="text" placeholder="https://api.gateway.ethswarm.org/bzz/… or 0x…" autocomplete="off" spellcheck="false" /></label>
          <label class="field reader-endpoint"><span>Bee or gateway endpoint</span><input id="reader-bee-url" type="url" value="${GATEWAY_DEFAULT}" autocomplete="url" /><small>Public gateways may allow reads but do not usually allow postage-backed uploads.</small></label>
          <button class="button button-primary" id="read-button" type="button">Open latest post <span>↗</span></button>
          <div class="notice" id="reader-notice" role="status" aria-live="polite" hidden></div>
          <article class="reader-post" id="reader-post" hidden></article>
        </section>
      </section>
      <section class="how-section">
        <div><p class="eyebrow">HOW THE LINK WORKS</p><h2>Content, feed,<br />one steady link.</h2></div>
        <div class="how-steps">
          <div class="how-step"><span>01</span><div><strong>The post</strong><p>Each version is uploaded as immutable content on Swarm and has its own content reference.</p></div></div>
          <div class="how-step"><span>02</span><div><strong>The feed</strong><p>A signed Swarm Feed update stores the latest post reference under your publisher identity.</p></div></div>
          <div class="how-step"><span>03</span><div><strong>The reader link</strong><p>A small reader page is also stored on Swarm. It follows the same feed address as you publish future versions.</p></div></div>
        </div>
      </section>
    </main>
    <footer><a class="brand footer-brand" href="#" aria-label="Stillhere home">
      <svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="brand-fill-footer" x1="5" y1="4" x2="43" y2="45" gradientUnits="userSpaceOnUse"><stop stop-color="#4f8063"/><stop offset="1" stop-color="#244b36"/></linearGradient></defs><rect x="2" y="2" width="44" height="44" rx="15" fill="url(#brand-fill-footer)"/><path d="M12 30.5h8.5c2.8 0 4.5-1.6 4.5-4.1s-1.7-4.1-4.5-4.1h-1c-2.8 0-4.5-1.6-4.5-4.1s1.7-4.1 4.5-4.1H28c2.8 0 4.5 1.6 4.5 4.1v17" fill="none" stroke="#f8f6e8" stroke-width="2.8" stroke-linecap="round"/><circle cx="32.5" cy="35.2" r="3.6" fill="#d7e89a"/></svg>
      <span class="brand-word">stillhere</span></a><span>Independent publishing, without a promise of forever.</span><a href="https://docs.ethswarm.org/" target="_blank" rel="noopener noreferrer">Swarm documentation ↗</a></footer>
  </div>
`

const $ = (selector) => document.querySelector(selector)
const publishNotice = $('#publish-notice')
const readerNotice = $('#reader-notice')
const publishProgress = $('#publish-progress')
let publisherKey = null
let publisherAddress = ''
let activePrivateKey = ''

function showNotice(element, message, isError = false) {
  element.textContent = message
  element.classList.toggle('error', isError)
  element.hidden = false
}

function hideNotice(element) {
  element.hidden = true
  element.textContent = ''
  element.classList.remove('error')
}

function setBusy(button, busy, label) {
  button.disabled = busy
  button.setAttribute('aria-busy', String(busy))
  button.classList.toggle('busy', busy)
  button.dataset.originalLabel ??= button.innerHTML
  button.innerHTML = busy ? `<span class="spinner"></span>${label}` : button.dataset.originalLabel
}

function updatePublishProgress(message, step) {
  $('#publish-progress-text').textContent = message
  publishProgress.dataset.step = step
  publishProgress.hidden = false
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // Fall back to the selection-based copy path for restricted browser contexts.
    }
  }
  const input = document.createElement('textarea')
  input.value = value
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.append(input)
  input.select()
  const copied = document.execCommand('copy')
  input.remove()
  if (!copied) throw new Error('Clipboard access was denied.')
}

function showCopied(button, label = 'Copied') {
  const original = button.dataset.copyLabel || button.innerHTML
  button.dataset.copyLabel = original
  button.textContent = label
  window.clearTimeout(Number(button.dataset.copyTimer))
  button.dataset.copyTimer = String(window.setTimeout(() => {
    button.innerHTML = original
    delete button.dataset.copyTimer
  }, 1800))
}

function readerCacheKey(address) {
  return `stillhere.reader.v1.${address.toLowerCase()}`
}

function validateEndpoint(value, name) {
  let url
  try {
    url = new URL(value.trim())
  } catch {
    throw new Error(`Enter a valid ${name} URL.`)
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error(`${name} must be an HTTP(S) URL without embedded credentials.`)
  }
  return url.toString().replace(/\/+$/, '')
}

async function loadPublisherKey(value) {
  const keyHex = normalizePrivateKey(value)
  const key = new PrivateKey(keyHex)
  publisherAddress = `0x${key.publicKey().address().toHex().replace(/^0x/i, '')}`
  publisherKey = keyHex
  activePrivateKey = keyHex
  $('#publisher-address').textContent = publisherAddress
  $('#identity-summary').textContent = 'Identity loaded in this tab. The private key is not persisted.'
  $('#identity-detail').hidden = false
  $('#private-key').value = keyHex
  $('#private-key').type = 'password'
  return publisherAddress
}

function clearPublisherKey() {
  publisherKey = null
  activePrivateKey = ''
  publisherAddress = ''
  $('#identity-detail').hidden = true
  $('#identity-summary').textContent = 'Create a key in this browser, or enter one you already own.'
}

function bytesAsText(value) {
  return new TextDecoder().decode(value)
}

$('#create-key').addEventListener('click', async () => {
  hideNotice(publishNotice)
  if (publisherKey && !window.confirm('Replace the publisher identity currently loaded in this tab? Make sure you have its private-key backup first.')) return
  try {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('')
    await loadPublisherKey(key)
    showNotice(publishNotice, 'New publisher identity created in this tab. Download a local backup after publishing and store it securely; anyone with that key can update your feed.')
  } catch (error) {
    showNotice(publishNotice, error.message || 'Could not create a publisher identity.', true)
  }
})

$('#private-key').addEventListener('change', async (event) => {
  hideNotice(publishNotice)
  if (!event.target.value.trim()) return
  try {
    await loadPublisherKey(event.target.value)
  } catch (error) {
    clearPublisherKey()
    showNotice(publishNotice, error.message || 'Could not load this key.', true)
  }
})

$('#private-key').addEventListener('input', (event) => {
  if (!publisherKey) return
  let matchesActiveKey = false
  try {
    matchesActiveKey = normalizePrivateKey(event.target.value) === publisherKey
  } catch {
    matchesActiveKey = false
  }
  if (!matchesActiveKey) clearPublisherKey()
})

document.querySelectorAll('[data-toggle-secret]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.toggleSecret)
    const reveal = input.type === 'password'
    input.type = reveal ? 'text' : 'password'
    const fieldName = input.id === 'stamp' ? 'postage batch ID' : 'private key'
    button.setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} ${fieldName}`)
    button.title = `${reveal ? 'Hide' : 'Show'} ${fieldName}`
    input.focus()
  })
})

$('#post-body').addEventListener('input', (event) => {
  $('#char-count').textContent = event.target.value.length.toLocaleString()
})

$('#load-sample').addEventListener('click', () => {
  const hasDraft = ['#post-title', '#post-author', '#post-body'].some((selector) => $(selector).value.trim())
  if (hasDraft && !window.confirm('Replace your current draft with the fictional demo post?')) return
  $('#post-title').value = 'The standpipe at the edge of town'
  $('#post-author').value = 'Field Notes from the Ward'
  $('#post-body').value = 'For the third morning this week, the standpipe opened after sunrise and ran for less than an hour. Neighbours took turns filling containers while the pressure held.\n\nThe water schedule posted at the depot still lists a delivery that did not arrive. We are asking the district office to publish the repair log, the names of the contractors, and the next confirmed delivery time.\n\nThis is an original fictional demo post. Replace it with reporting you have the right to publish.'
  $('#char-count').textContent = $('#post-body').value.length.toLocaleString()
  showNotice(publishNotice, 'Loaded a fictional, original demo post. It has not been published.')
})

$('#clear-draft').addEventListener('click', () => {
  const hasDraft = ['#post-title', '#post-author', '#post-body'].some((selector) => $(selector).value.trim())
  if (!hasDraft) {
    showNotice(publishNotice, 'Your draft is already empty.')
    return
  }
  if (!window.confirm('Clear the title, byline, and post text from this draft?')) return
  $('#post-title').value = ''
  $('#post-author').value = ''
  $('#post-body').value = ''
  $('#char-count').textContent = '0'
  showNotice(publishNotice, 'Draft cleared from this tab.')
})

$('#publish-button').addEventListener('click', async (event) => {
  hideNotice(publishNotice)
  publishProgress.hidden = true
  $('#publish-result').hidden = true
  const button = event.currentTarget
  const batchId = $('#stamp').value.trim()
  if (!publisherKey) return showNotice(publishNotice, 'Create or load your publisher key first.', true)
  if (!batchId) return showNotice(publishNotice, 'A funded postage batch ID is required for post content, reader page, and feed update.', true)
  let post
  try {
    post = makePost({
      title: $('#post-title').value,
      author: $('#post-author').value,
      body: $('#post-body').value,
    })
  } catch (error) {
    return showNotice(publishNotice, error.message, true)
  }
  let endpoint
  let gateway
  try {
    endpoint = validateEndpoint($('#bee-url').value, 'Bee endpoint')
    gateway = validateEndpoint($('#gateway-url').value || GATEWAY_DEFAULT, 'public gateway')
  } catch (error) {
    return showNotice(publishNotice, error.message, true)
  }
  setBusy(button, true, 'Publishing to Swarm…')
  try {
    const bee = new Bee(endpoint)
    updatePublishProgress('Uploading post content to Swarm…', 'post')
    const upload = await bee.data.upload(batchId, JSON.stringify(post), { contentType: 'application/json' })
    const postReference = upload.reference.toString()

    const cacheKey = readerCacheKey(publisherAddress)
    let shellReference
    let cacheWarning = false
    try {
      shellReference = localStorage.getItem(cacheKey)
    } catch {
      cacheWarning = true
    }
    if (!shellReference) {
      updatePublishProgress('Preparing your standalone reader page…', 'reader')
      const shellResponse = await fetch(new URL('reader.html', new URL(import.meta.env.BASE_URL, location.href)))
      if (!shellResponse.ok) throw new Error('Could not load the standalone reader shell. Run the app with npm run dev or build it first.')
      const shellHtml = await shellResponse.text()
      const shellUpload = await bee.file.upload(batchId, shellHtml, 'index.html', { contentType: 'text/html' })
      shellReference = shellUpload.reference.toString()
      try {
        localStorage.setItem(cacheKey, shellReference)
      } catch {
        cacheWarning = true
      }
    }

    const feedWriter = bee.feed.makeWriter(TOPIC, publisherKey)
    const pointer = makeFeedPointer(post, postReference)
    if (new TextEncoder().encode(pointer).byteLength > 4096) {
      throw new Error('The feed pointer exceeds Swarm’s 4 KB feed payload limit.')
    }
    updatePublishProgress('Pointing your feed to the latest post…', 'feed')
    await feedWriter.uploadPayload(batchId, pointer)

    const shareUrl = makeFeedUrl(shellReference, publisherAddress, TOPIC, gateway)
    $('#post-link').href = makeRawPostUrl(postReference, gateway)
    $('#post-link').textContent = $('#post-link').href
    $('#share-link').href = shareUrl
    $('#share-link').textContent = shareUrl
    $('#publish-result').hidden = false
    publishProgress.hidden = true
    showNotice(publishNotice, `The post, Swarm-hosted reader shell, and feed update were uploaded. Availability depends on postage and network conditions.${cacheWarning ? ' This browser could not cache the reader reference; it will upload the shell again on your next publish.' : ''}`)
  } catch (error) {
    publishProgress.hidden = true
    showNotice(publishNotice, error.message || 'Publishing failed. Check Bee reachability, CORS, the batch ID, and its remaining capacity.', true)
  } finally {
    setBusy(button, false)
  }
})

$('#read-button').addEventListener('click', async (event) => {
  hideNotice(readerNotice)
  $('#reader-post').hidden = true
  let selection
  try {
    selection = parseFeedInput($('#reader-input').value, TOPIC)
  } catch (error) {
    return showNotice(readerNotice, error.message, true)
  }
  const button = event.currentTarget
  setBusy(button, true, 'Resolving latest feed…')
  showNotice(readerNotice, 'Checking the latest feed update on Swarm…')
  try {
    const endpoint = validateEndpoint($('#reader-bee-url').value || GATEWAY_DEFAULT, 'Bee or gateway endpoint')
    const bee = new Bee(endpoint)
    const update = await bee.feed.makeReader(selection.topic, selection.owner).downloadPayload()
    const pointer = readFeedPointer(bytesAsText(update.payload))
    const data = await bee.data.download(pointer.reference)
    const post = JSON.parse(bytesAsText(data))
    const article = $('#reader-post')
    article.replaceChildren()
    const byline = document.createElement('p')
    byline.className = 'reader-byline'
    byline.textContent = `${post.author || 'Independent publisher'} · ${new Date(post.publishedAt).toLocaleString()}`
    const heading = document.createElement('h3')
    heading.textContent = post.title
    const content = document.createElement('div')
    content.className = 'reader-content'
    renderParagraphs(content, post.body)
    const link = document.createElement('a')
    link.href = makeRawPostUrl(pointer.reference, endpoint)
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.textContent = 'Open the post on Swarm ↗'
    article.append(byline, heading, content, link)
    article.hidden = false
    showNotice(readerNotice, 'Latest post resolved through the publisher’s feed.')
  } catch (error) {
    showNotice(readerNotice, error.message || 'Could not resolve this feed. Check the address and gateway availability.', true)
  } finally {
    setBusy(button, false)
  }
})

$('#copy-share').addEventListener('click', async () => {
  try {
    await copyText($('#share-link').href)
    showCopied($('#copy-share'))
  } catch (error) {
    showNotice(publishNotice, `${error.message} Select and copy the stable reader link above.`, true)
  }
})

$('#copy-address').addEventListener('click', async () => {
  try {
    await copyText(publisherAddress)
    showCopied($('#copy-address'))
  } catch (error) {
    showNotice(publishNotice, `${error.message} Select and copy the feed owner address.`, true)
  }
})

$('#save-key').addEventListener('click', () => {
  if (!activePrivateKey || !publisherAddress) return
  const backup = new Blob([JSON.stringify({
    warning: 'Keep this file private. Anyone with this key can publish updates to your feed.',
    address: publisherAddress,
    privateKey: activePrivateKey,
  }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(backup)
  const link = document.createElement('a')
  link.href = url
  link.download = `stillhere-key-${publisherAddress.slice(2, 10)}.json`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  showCopied($('#save-key'), 'Downloaded')
})

function chooseTab(name) {
  const publishing = name === 'publish'
  $('#publish-tab').classList.toggle('active', publishing)
  $('#read-tab').classList.toggle('active', !publishing)
  $('#publish-tab').setAttribute('aria-selected', String(publishing))
  $('#read-tab').setAttribute('aria-selected', String(!publishing))
  $('#publish-tab').tabIndex = publishing ? 0 : -1
  $('#read-tab').tabIndex = publishing ? -1 : 0
  $('#publish-panel').hidden = !publishing
  $('#read-panel').hidden = publishing
}

$('#publish-tab').addEventListener('click', () => chooseTab('publish'))
$('#read-tab').addEventListener('click', () => chooseTab('read'))
document.querySelector('[role="tablist"]').addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const tabs = [$('#publish-tab'), $('#read-tab')]
  const current = tabs.indexOf(document.activeElement)
  const next = event.key === 'Home' ? 0
    : event.key === 'End' ? tabs.length - 1
      : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
  tabs[next].focus()
  tabs[next].click()
})

const params = new URLSearchParams(location.search)
const ownerFromQuery = params.get('owner') || params.get('publisher')
if (ownerFromQuery) {
  chooseTab('read')
  $('#reader-input').value = location.href
  $('#reader-bee-url').value = GATEWAY_DEFAULT
  $('#read-button').click()
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)
    }
  }, { threshold: 0.12 })
  document.querySelectorAll('.workbench, .how-section').forEach((section) => {
    section.classList.add('reveal-section')
    revealObserver.observe(section)
  })
}
