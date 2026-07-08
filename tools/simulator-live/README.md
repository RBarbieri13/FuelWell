# FuelWell Live Simulator

This tool exposes the booted iOS simulator as a read-only webpage. It is meant
for quick remote review without sharing the whole Mac desktop.

## Start the Current Checkout

```bash
tools/simulator-live/rebuild-and-launch.sh
tools/simulator-live/start-viewer.sh
```

Open `http://127.0.0.1:8787`.

To share it, run this in another terminal:

```bash
cloudflared tunnel --url http://127.0.0.1:8787
```

## Keep Main Updated

Use a separate worktree so the live preview can follow merged changes without
touching the active development checkout:

```bash
tools/simulator-live/watch-main.sh
```

The watcher fetches `origin/main`, pulls fast-forward changes, rebuilds, and
relaunches the app whenever `main` moves.

For a standing shared URL, configure a Cloudflare Tunnel public hostname to
forward to `http://127.0.0.1:8787` and protect it with Cloudflare Access.
