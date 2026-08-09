---
# ============================================================================
# PROJECT / PAPER PAGE TEMPLATE
#
#   cp _DRAFT-example.md my-paper.md      → /projects/my-paper
#   mkdir -p ../../../public/projects/my-paper   (figures live here)
#
# Files starting with `_` are never loaded, so this one stays as a reference.
# See the README for the full walkthrough. cola.md is a filled-in example.
# ============================================================================

# --- Required ---------------------------------------------------------------
title: "Paper or project title"
description: "One-liner. Shown on the /projects index only."

# --- Header -----------------------------------------------------------------
tldr: "The whole result in one sentence. Renders in a highlighted block."
venue: "ICML 2026"                    # pill above the title; omit if unpublished
authors:
  # `affiliation` is the superscript marker; `equal: true` adds a *
  - { name: "Wish Suharitdamrong", url: "https://peterwisu.github.io", affiliation: "1", equal: true }
  - { name: "Co Author", affiliation: "1,2", equal: true }
  - { name: "Senior Author", affiliation: "1" }
affiliations:                          # item n = what superscript n means
  - "Surrey Institute for People-Centred AI, University of Surrey"
  - "Second affiliation, if any"
equal_note: "Equal contribution"

# --- Links ------------------------------------------------------------------
# Set one and its chip appears; omit it and it doesn't. Fixed order:
# paper · arXiv · OpenReview · code · model · demo · video · poster · slides
# paper: "https://proceedings.mlr.press/..."
# arxiv: "https://arxiv.org/abs/..."
# openreview: "https://openreview.net/forum?id=..."
# repo: "https://github.com/peterwisu/..."     → "code"
# model: "https://huggingface.co/..."
# url: "https://your-demo"                     → "demo"
# video: "https://youtu.be/..."
# poster: "/projects/my-paper/poster.pdf"
# slides: "/projects/my-paper/slides.pdf"
links:                                 # anything else, appended to the row
  - { label: "data", href: "#" }

# --- Teaser -----------------------------------------------------------------
# Reference from the site root, NOT relatively — these pages sit one level deep.
teaser: "/projects/my-paper/teaser.png"
teaser_caption: "One sentence saying what the figure shows."

# --- Citation ---------------------------------------------------------------
# `citations` renders a BibTeX section with a copy button per entry.
# For a single entry you can use `bibtex: |` instead.
citations:
  - label: "ICML 2026"
    bibtex: |
      @inproceedings{key2026,
        title     = {...},
        author    = {Suharitdamrong, Wish and ...},
        booktitle = {International Conference on Machine Learning (ICML)},
        year      = {2026}
      }

# --- Misc -------------------------------------------------------------------
tech: ["python", "pytorch"]            # small · separated list under the title
date: 2026-05-01                       # sort order on /projects, newest first
draft: true                            # flip to false to publish
---

## Abstract

Everything below the frontmatter is plain markdown. Break it into `##`
sections and write the headings as *claims*, not topics — someone scanning only
the headings should come away with the argument.

## The gap this closes

Two or three sentences. Best supported by a figure showing before and after in
the same layout.

## Method

The core idea and the one equation that matters. Link the PDF for the rest.

## Results

| method | benchmark | trainable params |
| ------ | --------- | ---------------- |
| baseline |         |                  |
| ours     |         |                  |

Images use the same site-root paths as the teaser:

![alt text](/projects/my-paper/results.png)

For a caption, drop to HTML:

<figure>
  <img src="/projects/my-paper/qualitative.png" alt="alt text" />
  <figcaption>Rendered small and grey.</figcaption>
</figure>

<!--
Interactive widgets: rename this file to .mdx, then import a React component.
`client:visible` loads its JS only when scrolled into view.

  import FigureSlider from "../../components/FigureSlider.tsx";

  <FigureSlider client:visible name="Layer" frames={[
    { src: "/projects/my-paper/layer-01.png", label: "1" },
    { src: "/projects/my-paper/layer-32.png", label: "32" }
  ]} />
-->
