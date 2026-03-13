# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT open a public issue**
2. Email the maintainers with details of the vulnerability
3. Include steps to reproduce if possible
4. We'll acknowledge within 48 hours and work on a fix

## Architecture

### Client-Side Security
Excalimate is a **static single-page application**. All core functionality runs entirely in the browser:

- **Rendering**: Excalidraw's Canvas2D renderer
- **Animation**: Keyframe interpolation computed client-side
- **Export**: WebCodecs VideoEncoder + Canvas API (browser-native)
- **File I/O**: Browser File System Access API

**No server is required** for creating, editing, animating, or exporting.

### E2E Encrypted Sharing
When sharing via URL:

1. A random AES-128-GCM key is generated client-side
2. The project is encrypted before uploading to the server
3. The encryption key is placed in the URL `#hash` fragment — **never sent to the server**
4. Recipients decrypt client-side using the key from the URL

The server only stores opaque encrypted blobs. Even if compromised, the data is unreadable.

### MCP Server
The MCP server is designed for **local use** (localhost). If you expose it to the internet:

- Add authentication (the server has none by default)
- Configure CORS to restrict origins
- Use HTTPS
- Add rate limiting

## Dependency Security

Run `npm audit` regularly. The project uses well-known packages:
- `@excalidraw/excalidraw` — Excalidraw editor
- `react`, `zustand` — UI framework
- `webm-muxer`, `mp4-muxer` — video encoding
- `@modelcontextprotocol/sdk` — MCP protocol (MCP server only)
