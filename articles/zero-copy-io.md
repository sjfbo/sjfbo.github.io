---
title: Zero‑copy I/O: when copies really matter
date: 2025-10-01
tags: os, performance
summary: Copying between user and kernel space is costly; zero‑copy interfaces avoid redundant copies and reduce CPU and cache pressure.
slug: zero-copy-io
---

Copying bytes between user space and kernel space is surprisingly expensive, especially at high throughput. Zero‑copy techniques reduce CPU cycles and cache pressure by avoiding redundant copies.

## Classic path vs zero‑copy

Traditional `read()` + `write()` copies data twice: disk → kernel buffer, then kernel → user buffer, then user → kernel (socket) buffer. Interfaces like `sendfile()` and modern io_uring splice APIs can skip user space entirely.

```c
// pseudo: send file contents directly to socket
// kernel moves pages from page cache to socket buffers
sendfile(sock_fd, file_fd, &offset, length);
```

## When it helps

- Serving large static assets (e.g., CDN, file servers).
- High‑throughput networking where CPU is the bottleneck.
- Reducing cache pollution in data‑plane heavy services.

It’s not always a win—zero‑copy can add constraints and interacts with TLS, transformations, and checksumming. Measure with your workload.


