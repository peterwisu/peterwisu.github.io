---
# === Blog post template ===
# Required: title, date
# Optional: summary, tags, draft
#
# Filename becomes the URL slug: this file → /blogs/hello-world
title: "Hello, world"
date: 2026-05-01
summary: "First post — testing the blog pipeline."
tags: ["meta"]
draft: false
---

This is the body of the first blog post, written in plain markdown.

You can write headings, lists, code blocks, and links here just like any markdown file.

```python
def hello():
    print("hello, world")
```

Drop new posts in `src/content/blog/` as `your-slug.md` and they'll show up in
the index sorted newest first. Set `draft: true` to keep a post in the repo
without publishing it.
