# IDENTITY.md — Organizational Identity

_This file bridges OpenClaw agent identity with EIP-4824 organizational identity. Fill in during setup._

---

## Core Identity

- **Name:** _(e.g., ReFi BCN, Regen Coordination, DAO XYZ)_
- **Type:** _(DAO | Cooperative | Foundation | Project | LocalNode | Network)_
- **Emoji:** _(a signature visual — e.g., 🌱, 🌀, ⚡)_
- **Short description:** _(One line — what this org is)_

---

## On-Chain Identity

- **daoURI:** `https://[your-org].github.io/.well-known/dao.json`
- **Primary Chain:** _(e.g., eip155:100 for Gnosis Chain, eip155:1 for Ethereum mainnet)_
- **Registration Contract:** _(EIP-4824 registration contract address, if registered)_

---

## Treasury

- **Primary Safe:** _(Gnosis Safe address on primary chain)_
- **Operational Wallet:** _(if different from Safe)_
- **Additional Addresses:**
  - _(name): address (chain)_

---

## Governance Infrastructure

- **Hats Protocol Tree ID:** _(if using Hats for roles)_
- **Gardens DAO:** _(contract address, if using Gardens)_
- **Snapshot Space:** _(e.g., ens.eth)_
- **Karma Gap:** _(project ID or URL)_

---

## Federation Identity

- **Network:** _(e.g., regen-coordination)_
- **Node ID:** _(kebab-case node identifier, e.g., refi-bcn)_
- **Hub:** _(e.g., github.com/regen-coordination/hub)_

---

## Contact

- **GitHub:** github.com/[org-name]
- **Telegram:** @[group-handle]
- **Website:** https://[website]
- **Email:** [contact@org]

---

_This file is read by agents at session startup to ground their understanding of who they are operating as. Keep it current as the organization evolves._
