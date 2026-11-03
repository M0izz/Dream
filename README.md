# Stillhere

**One stable link to a publisher's latest work, backed by Swarm.**

> Divya edits a two-person community newsroom covering a district water-supply scandal. In one month her web host suspended the account after a legal notice, the registrar froze the domain, and the shared-drive archive was flagged and locked. Each time, every link her readers had saved went dead and the back catalogue went with it.

Stillhere is built for the specific takedown in Divya's story: the newsroom's own app host, web server, and domain are not needed to open its Swarm-hosted reader link. Each post is stored as content on Swarm; a signed Swarm Feed points to the latest post; and a small, self-contained reader page resolves that feed. Publishing a new post updates the feed, so readers can keep using the same link.

This is a publishing tool, not a recovery service. It cannot restore material that was never published to Swarm, and it does not promise that published content will remain available forever. The demo post is original fictional sample text; replace it with material you have the right to publish.

## What it does

- Publishes plain-text posts to Swarm and updates a sequence feed with the latest post reference.
- Creates a standalone reader page on Swarm and a share link that includes the publisher and feed topic.
- Lets readers open a stable link or look up a publisher feed in the reader panel.
- Keeps the publisher's private key in the browser tab for local feed signing; it is not saved in browser storage, sent to Bee, or logged.
- Avoids a Stillhere backend, account database, and pubsub dependency. The feed is the source of the latest-post pointer.

## Run locally

**Requirements:** Node.js 20 or newer and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The app has separate **Publish a post** and **Read a feed** panels. The development command prepares the standalone reader page before starting Vite.

To create and preview a production build:

```sh
npm run build
npm run preview
```

The production files are written to `dist/`. The reader page is bundled as a self-contained HTML file so it can be uploaded to Swarm independently of the Stillhere app.

## Publish a post

Publishing requires a reachable, writable Bee node and an active postage batch. A public read gateway is not generally a substitute for a Bee node when uploading.

1. **Connect to Bee.** Enter the Bee HTTP API endpoint. For a local node, the default is `http://localhost:1633`. Configure Bee to allow browser requests from the Stillhere origin (CORS). Only connect to a node you trust.
2. **Provide postage.** Enter an active batch ID with enough remaining capacity. Postage is required for the post, the reader page on its initial upload, and each feed update. Stillhere does not create or fund batches.
3. **Choose a publisher identity.** Select **Create key** to generate one in the browser, or enter an existing 32-byte private key. Use **Download key backup** and keep the backup private; anyone with this key can publish updates to the feed. A lost key cannot be recovered by Stillhere.
4. **Write and publish.** Enter a title and post, or load the clearly labeled fictional sample. Publishing uploads the post, uploads the reader page if it is not already cached for this publisher in this browser, and writes the new feed pointer.
5. **Keep and test the link.** Copy **Stable reader link** and open it in a separate browser or device. You can also use **Read a feed** to resolve a publisher address or stable link.

Posts and reader pages are public on Swarm. Do not publish private, confidential, or identifying material unless it is safe for anyone to read. The private key is not the postage batch ID: never enter the key in the batch field.

### About postage batches

A Bee node is software that connects to Swarm and exposes an API for reading and writing data. A postage batch represents prepaid storage capacity; its ID authorizes uploads against that capacity. You must obtain a batch from a suitably configured and funded Bee node. Stillhere cannot generate a valid ID for you, and no Stillhere post or batch was created for this repository.

Swarm Desktop's default ultra-light node is intended for reading and is not sufficient for Stillhere publishing. Publishing requires a light node configured for uploads, funding, and an active batch. Review the [Bee documentation](https://docs.ethswarm.org/) and [Swarm Desktop documentation](https://github.com/ethersphere/bee-docs/blob/master/docs/desktop/) for current setup instructions before funding or changing node modes.

## How the link works

1. **Post content:** each post version is uploaded as immutable Swarm data and gets its own content reference.
2. **Latest pointer:** a signed Swarm Feed sequence update stores a compact pointer to that post. Stillhere checks that the pointer fits within Swarm's 4 KB feed-payload limit.
3. **Reader page:** a self-contained page is uploaded to Swarm. The share link opens that page with the publisher address and feed topic; the page reads the current feed update and then loads the referenced post.

The standalone reader and the publisher app have different jobs: the reader link does not point back to the Stillhere web server. The reader page uses the gateway from the link's origin to resolve the feed and post.

## Availability and security

- **Swarm is not a permanence guarantee.** Access depends on valid postage, remaining batch capacity, storage and network conditions, and an available Bee node or gateway. Expired, depleted, or otherwise unavailable postage can affect availability.
- **Gateways are access routes, not guarantees.** The default public gateway is `https://api.gateway.ethswarm.org`. If a gateway becomes unavailable, a different gateway may be used, but the replacement link may have a different URL.
- **Keep independent backups.** Retain the original post text and a secure key backup. Swarm availability does not replace an editorial archive or key-management plan.
- **Protect the publisher key.** The key stays in the current page's memory and is cleared when that page is closed or refreshed. It is not stored in local/session storage, sent to Bee, or logged by Stillhere. Anyone who obtains the key can update the feed.
- **Reader data is public.** The feed pointer, posts, and reader page can be read by anyone with access to Swarm.

## Swarm reference

The [official Bee documentation's website-publishing example](https://github.com/ethersphere/bee-docs/blob/master/docs/desktop/publish-a-website.md) lists this public Swarm reference:

[`bc9b942212421e2a19fe1ffdf0add641ae530923041ea8f549381747b14b2f2d`](https://api.gateway.ethswarm.org/bzz/bc9b942212421e2a19fe1ffdf0add641ae530923041ea8f549381747b14b2f2d/)

This is an existing documentation example, **not content published by Stillhere**. No Stillhere post was uploaded for this repository because publishing requires an operator-provided writable Bee node and active postage batch. After a successful publish, Stillhere shows the genuine post reference and stable reader link in the result card.

## Development checks

```sh
npm test
npm run build
```
