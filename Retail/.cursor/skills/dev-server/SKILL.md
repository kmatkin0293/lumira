---
name: dev-server
description: Start or stop the RFA local development server (port 8081). Use when the user asks to start, stop, restart, run, or kill the dev server, web app, or local server.
---

# RFA Dev Server

Project: `/Users/jette.dieckmann/Documents/Cursor Projects/Template/RFA (Katie)/RFA`
Port: **8081** · URL: http://localhost:8081

## Start the server

```bash
bash ".cursor/skills/dev-server/scripts/start.sh"
```

Opens automatically in the browser. If already running, the script says so and exits cleanly.

## Stop the server

```bash
bash ".cursor/skills/dev-server/scripts/stop.sh"
```

Kills whatever process is occupying port 8081.

## Restart the server

Run stop, then start:

```bash
bash ".cursor/skills/dev-server/scripts/stop.sh" && bash ".cursor/skills/dev-server/scripts/start.sh"
```
