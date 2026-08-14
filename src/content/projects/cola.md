---
title: "CoLA: Cross-Modal Low-rank Adaptation for Multimodal Downstream Tasks"
icon: "🥤"
logo: "/projects/cola/logo.png"
description: "A PEFT framework that extends LoRA with a dedicated inter-modal adaptation pathway, for adapting dual-stream unimodal encoders to multimodal tasks."
tldr: "In a dual encoder model, LoRA adapts each modality encoder in isolation, so it never captures cross-modal interaction. CoLA adds a dedicated inter-modal path alongside the standard intra-modal one inside the adapted layers of both encoders, giving around 3% relative gain over LoRA on visual grounding and 2% on audio-visual benchmarks at the same parameter budget."
venue: "ICML 2026"
authors:
  - { name: "Wish Suharitdamrong", url: "https://peterwisu.github.io", affiliation: "1" }
  - { name: "Tony Alex", url: "https://www.linkedin.com/in/tony-alex-203b5a114/", affiliation: "1,2" }
  - { name: "Muhammad Awais", url: "https://www.surrey.ac.uk/people/muhammad-awais", affiliation: "1,2" }
  - { name: "Sara Atito", url: "https://www.surrey.ac.uk/people/sara-atito", affiliation: "1,2" }
affiliations:
  - name: "Surrey Institute for People-Centred AI, University of Surrey"
    logo: "/logos/pai.png"
    url: "https://www.surrey.ac.uk/artificial-intelligence"
  - name: "Centre for Vision, Speech and Signal Processing (CVSSP), University of Surrey"
    logo: "/logos/cvssp.png"
    url: "https://www.surrey.ac.uk/centre-vision-speech-signal-processing"
    invert: true       # white artwork — flipped to black in light mode
    logo_height: 34    # wider aspect than PAI, so it needs less height
paper: "https://arxiv.org/abs/2604.03314"
venue_site: "https://icml.cc/virtual/2026/poster/65985"
# openreview: "https://openreview.net/forum?id=8CBWgJY7n9"
repo: "https://github.com/peterwisu/CoLA"
citations:
  - label: "ICML 2026"
    bibtex: |
      @inproceedings{suharitdamrong2026cola,
        title     = {CoLA: Cross-Modal Low-rank Adaptation for Multimodal Downstream Tasks},
        author    = {Suharitdamrong, Wish and Alex, Tony and Awais, Muhammad and Atito, Sara},
        booktitle = {International Conference on Machine Learning (ICML)},
        year      = {2026}
      }
date: 2026-04-30
draft: false
---

## Motivation
 
A common way to build a multimodal system is a dual encoder, with one encoder per
modality joined by a lightweight task decoder. The standard way to adapt one is
LoRA, but a LoRA update lives entirely inside a single encoder. Each side is
adapted using only its own features, so at the exact stage where the model is
learning representations for the task, the two encoders have no way to tell each
other anything.

<img src="/projects/cola/cola-figure1.gif" alt="TODO: describe the figure" />

## The idea
 
CoLA keeps LoRA's pathway for modality-specific adaptation and adds a second
low-rank pathway dedicated to cross-modal fusion.
 
$$
h_m = W_0^m x_m + \Delta W_L^m x_m + \Delta W_C^m x_m
\qquad\text{with}\qquad
\Delta W_C^m = \lambda \, B_C^m \, \Phi^m \, A_C^m
$$
 
The new pathway is not static. $\Phi^m$ is generated on the fly by a small
hypernetwork reading the **other** modality's features, so the update applied to
each linear layer changes with the cross-modal input, and a learnable $\lambda$
lets every layer decide for itself how much of that signal it wants. As features
move through self-attention, output projection, and the feed-forward network,
they are progressively re-exchanged between the two encoders, so each stage
fuses the freshest features from its partner rather than a stale copy.
 
<figure>
  <img src="/projects/cola/cola-figure2.gif" alt="CoLA architecture. On the left, each frozen linear layer receives an intra-modal LoRA update plus an inter-modal update whose core matrix is generated from the paired modality's features by a hypernetwork. On the right, cross-modal features are propagated progressively between the dual encoders through the self-attention, output projection, and feed-forward stages." />
  <figcaption>On the left, each frozen layer receives two updates, one intra-modal and one inter-modal, the latter generated from the paired modality by a hypernetwork. On the right, the exchanged features are refreshed at every stage of the block.</figcaption>
</figure>


## The payoff
 
At the same parameter budget, CoLA beats LoRA on every benchmark we test,
whether LoRA is matched on rank or given extra rank to match CoLA's trainable
parameter count. It also enables the first multitask visual grounding framework
built entirely on parameter-efficient fine-tuning.
 
| method | REC ↑ | RES ↑ | AVE ↑ | AVS ↑ |
| ------ | ----- | ----- | ----- | ----- |
| LoRA, rank-matched | 82.3 | 72.2 | 79.2 | 80.1 |
| LoRA, parameter-matched | 81.8 | 72.3 | 79.2 | 80.2 |
| **CoLA** | **83.4** | **73.7** | **80.7** | **80.9** |
 
Spending the same budget on more LoRA rank does not close the gap, and on REC it
slightly hurts. The gain comes from the cross-modal structure, not the parameter
count.