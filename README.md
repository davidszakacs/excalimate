# Animate-Excalidraw

Create keyframe animations from Excalidraw designs. Draw diagrams with the full Excalidraw editor, then animate elements with opacity fades, position slides, scale effects, rotation, and arrow draw-on animations. Export as MP4, WebM, GIF, or animated SVG.

Includes an **MCP server** for AI-driven animation — let Copilot, Claude or other AI agents create and animate diagrams in real-time.

## Features

- **Full Excalidraw editor** — draw, edit, resize, connect arrows, add text — everything Excalidraw does
- **Keyframe animation** — opacity, position, scale, rotation, draw progress (for arrows/lines)
- **Timeline** — collapsible per-element tracks, clip start/end markers, scrubbing
- **Sequence reveal** — stagger-reveal multiple elements with one click
- **Camera frame** — pan/zoom animation, aspect ratio control
- **Export** — MP4 (H.264), WebM (VP9), GIF, animated SVG
- **E2E encrypted sharing** — share via URL, encryption key stays in the hash fragment
- **MCP server** — AI agents can create scenes, animate them, and preview in real-time
- **Live mode** — see AI changes in the editor as they happen via SSE

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### With MCP Server (optional)

```bash
# Build and start the MCP server
cd mcp-server
npm install
npm run build
node dist/index.js
```

The MCP server runs on `http://localhost:3001`. Click **📡 Live** in the toolbar to connect.

## Usage

### Edit Mode
Draw your diagram using the Excalidraw editor. All standard tools work — rectangles, ellipses, arrows, text, groups, etc.

### Animate Mode
Switch to Animate mode (Ctrl+E) to:
1. Select elements and modify properties in the right panel — keyframes are created automatically
2. Use the timeline to scrub, move keyframes, and set clip range
3. Click **🎬 Sequence** to create staggered reveal animations
4. Click **Export** to render as video

### MCP Server
The MCP server lets AI agents create and animate diagrams. You can use it with the **deployed web app** or a local dev instance.

#### Option 1: Deployed web app + local MCP server

```bash
# Install and start the MCP server locally
cd mcp-server
npm install
npm run build
node dist/index.js
# → MCP server running at http://localhost:3001
```

Then open the deployed web app in your browser and click **📡 Live** in the toolbar. The web app connects to your local MCP server — the AI creates designs and animations that appear in real-time in your browser.

#### Option 2: Claude Desktop / Copilot CLI (stdio)

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "animate-excalidraw": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js", "--stdio"]
    }
  }
}
```

The AI can create scenes and animations. Use `save_checkpoint` to save, then load in the web app via the **MCP** button in the toolbar.

#### Option 3: Both at once

Run the MCP server in HTTP mode (default, not `--stdio`) and configure your AI tool to connect to `http://localhost:3001/mcp`. Open the web app and click **📡 Live**. Now the AI creates, you watch in real-time, and you can edit alongside the AI.

See [mcp-server/README.md](mcp-server/README.md) for full documentation and [mcp-server/SKILL.md](mcp-server/SKILL.md) for the AI skill guide.

## Architecture

```
animate-excalidraw/
├── src/                    # React web app (Vite + TypeScript)
│   ├── components/         # UI components (Toolbar, Timeline, PropertyPanel, etc.)
│   ├── core/               # Animation engine, interpolation, playback
│   ├── stores/             # Zustand state (project, animation, UI, undo/redo)
│   ├── services/           # Export pipeline, file I/O, encryption
│   └── hooks/              # Custom hooks (hotkeys, MCP live)
├── mcp-server/             # MCP server (Node.js + TypeScript)
│   ├── src/                # Server, tools, state, checkpoints
│   ├── SKILL.md            # AI skill guide
│   └── references/         # Detailed reference docs
└── public/                 # Static assets
```

**Key design**: The web app is a **static SPA** — all rendering, animation, and editing happens in the browser. No server needed for core functionality. The MCP server is optional (for AI integration and live preview).

## Security

- **Client-side only** — core app stores nothing server-side
- **E2E encrypted sharing** — AES-128-GCM encryption, key in URL hash (never sent to server)
- **Export** — all rendering happens in-browser via WebCodecs/Canvas
- **MCP server** — designed for local use; needs authentication if exposed to internet

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests (280 tests)
npm run lint         # ESLint
```

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes with tests
4. Open a pull request

## Acknowledgements

This project was inspired by [excalidraw-animate](https://github.com/dai-shi/excalidraw-animate) by [Daishi Kato](https://github.com/dai-shi), which demonstrated that Excalidraw drawings could be brought to life with animations. Thank you for the inspiration!

Built with [Excalidraw](https://excalidraw.com) — the amazing open-source virtual whiteboard.

## License

MIT — see [LICENSE](LICENSE)
