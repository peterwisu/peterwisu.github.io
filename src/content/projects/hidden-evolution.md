---
title: "The Hidden Evolution of Disguised Visual Context inside the VLM"
icon: "👀"
# logo: "/projects/hidden-evolution/logo.png"
description: "A study of how different vision integration paradigms behave in VLMs, and how each one transforms the visual representation inside the LLM."
venue: "arXiv preprint (under review), 2026"
authors:
  - { name: "Wish Suharitdamrong", url: "https://peterwisu.github.io", affiliation: "1" }
  - { name: "Tony Alex", url: "https://www.linkedin.com/in/tony-alex-203b5a114/", affiliation: "1,2" }
  - { name: "Xiatian Zhu", url: "https://www.surrey.ac.uk/people/xiatian-zhu", affiliation: "1,2" }
  - { name: "Muhammad Awais", url: "https://www.surrey.ac.uk/people/muhammad-awais", affiliation: "1,2" }
  - { name: "Sara Atito", url: "https://www.surrey.ac.uk/people/sara-atito", affiliation: "1,2" }
affiliations:
  - name: "Surrey Institute for People-Centred AI, University of Surrey"
    logo: "/logos/pai.png"
    url: "https://www.surrey.ac.uk/artificial-intelligence"
  - name: "Centre for Vision, Speech and Signal Processing (CVSSP), University of Surrey"
    logo: "/logos/cvssp.png"
    url: "https://www.surrey.ac.uk/centre-vision-speech-signal-processing"
    invert: true
    logo_height: 34
paper: "https://arxiv.org/abs/2606.20077"
# repo: "https://github.com/peterwisu/..."
citations:
  - label: "arXiv"
    bibtex: |
      @article{suharitdamrong2026hidden,
        title   = {The Hidden Evolution of Disguised Visual Context inside the VLM},
        author  = {Suharitdamrong, Wish and Alex, Tony and Zhu, Xiatian and Awais, Muhammad and Atito, Sara},
        journal = {arXiv preprint arXiv:2606.20077},
        year    = {2026}
      }
references:
  - text: "Liu, H., Li, C., Wu, Q., Lee, Y. J. <em>Visual Instruction Tuning</em>. NeurIPS, 2023."
    href: "https://arxiv.org/abs/2304.08485"
  - text: "Alayrac, J.-B., Donahue, J., Luc, P., et al. <em>Flamingo: a Visual Language Model for Few-Shot Learning</em>. NeurIPS, 2022."
    href: "https://arxiv.org/abs/2204.14198"
  - text: "Alex, T., Suharitdamrong, W., Atito, S., et al. <em>PAL: Probing Audio Encoders via LLMs</em>. arXiv preprint, 2025."
    href: "https://arxiv.org/abs/2506.10423"
date: 2026-06-24
draft: false
---

## Motivation

Visual tokens enter a language model as raw, foreign signals. How they are transformed into meaningful representations and interact with the language inside LLM depends entirely on the integration architecture. Several integratio paradigms exist, from simply concatenating visual tokens into the input sequence to injecting them at intermediate layers for efficient attention computation. Yet, There is little evidence for which paradigm is better, most of existing comparisons vary in training data, token budget, model scale and optimisation. Furthermore, how each paradigm reshapes visual representations across layers remains underexplored.

## Integration Paradigms

<figure>
  <img src="/projects/hidden-evolution/vlm-injection.gif" alt="Animated comparison of three VLM integration architectures. In-context injection places connector-projected vision tokens in the input sequence alongside language tokens. Layer-wise gated cross-attention injection routes vision tokens through a connector into a gated cross-attention block at every LLM layer. Layer-wise attention injection feeds connector output into each layer's attention without a gate." />
  <figcaption>The three integration styles. <strong>IN-CT</strong> places vision tokens in the sequence; <strong>LW-GC</strong> injects them through gated cross-attention at each layer; <strong>LW-AT</strong> injects them into each layer's attention directly.</figcaption>
</figure>

We compare three paradigms, each widely adopted and representative of a distinct
design philosophy for delivering visual context into an LLM.
 
1. **In-context injection** (IN-CT) projects visual features through a connector
   and concatenates them with text at the input, so both pass through the LLM's
   standard transformer blocks together. This is the LLaVA design
   <a href="#ref-1" class="cite">[1]</a>.

2. **Layer-wise gated cross-attention injection** (LW-GC) starts from text alone
   and feeds visual features through a layer-specific connector into a dedicated
   cross-attention block and gated FFN at each layer, both scaled by learnable
   gates initialised at zero. This follows Flamingo
   <a href="#ref-2" class="cite">[2]</a>.

3. **Layer-wise attention injection** (LW-AT) also starts from text alone and
   injects at every layer, but into the keys and values of the LLM's existing
   attention, bypassing the FFN sublayers. It sits between the other two,
   injecting layer by layer like LW-GC while letting visual and text tokens
   interact in standard attention like IN-CT. This follows the LAL design from
   PAL <a href="#ref-3" class="cite">[3]</a>.

All three share the same vision encoder, MLP connector and visual token count,
with no token compression in LW-GC. Data, recipe and optimisation are held fixed
across seven configurations spanning two model families and four scales, so
differences can be attributed to the integration design itself.

## Benchmark Results

<figure>
  <img src="/projects/hidden-evolution/fig2-benchmarks.png" alt="Radar plots of per-benchmark scores for four integration styles across seven model backbones." />
  <figcaption>Twenty benchmarks over five task families, for four integration styles across seven backbones (Qwen 0.5B/3B/7B and LLaMA 1B/3B, NeXT and OV recipes).</figcaption>
</figure>

Across twenty benchmarks in five task families, IN-CT achieves the best overall results, followed by LW-AT, while LW-GC lags significantly. The ordering is consistent across single-image, multi-image and video settings. IN-CT and LW-AT stay close on general and knowledge benchmarks and separate most on OCR and video, where LW-GC falls away almost entirely.


 
## Analysis
 
The benchmark results leave a consistent gap between in-context and layer-wise
injection. What causes it? We examine four things inside the LLM. Whether visual
tokens semantically evolve across layers, what visual features they capture,
whether they align with the language representation space, and when the model
uses them during generation.
 
## Representation Evolution and Frequency
 
Centered kernel alignment between layers shows two regimes. Under IN-CT, visual
tokens undergo a smooth, uniform transformation across layers, mirroring the
progressive refinement of text tokens, with residual connections keeping each
layer's change incremental. Both layer-wise paradigms show severe
discontinuities instead, because their visual tokens have no residual
connections and each layer receives an independent projection of the original
encoder features. Text tokens behave almost the same under all three, so this is
specific to vision.

<figure>
  <img src="/projects/hidden-evolution/fig4-cka-fft.png" alt="Layer-to-layer representation similarity for vision and text tokens under the three integration styles, alongside the change in log amplitude of the token representations across layers." />
  <figcaption>(a to c) Layer-to-layer similarity for vision tokens (top) and text tokens (bottom) under IN-CT, LW-AT and LW-GC. (d to g) Change in log amplitude across layers for COCO, ChartQA, RealWorld-QA and DocVQA, and the mean across tasks per integration style.</figcaption>
</figure>

The frequency view shows which features survive. Under IN-CT the relative log
amplitude rises gradually through the early and middle layers, a progressive
shift toward fine-grained local detail such as texture and edges, which may
explain its advantage on OCR and video. LW-AT fluctuates but stays relatively
stable and lower-frequency on average, and LW-GC oscillates erratically with no
coherent trend, also low-frequency biased. IN-CT then drops sharply in the final
layers, consolidating that fine detail into more abstract, global
representations.



## Modality Alignment and Usage
 
Projecting image and text tokens into a shared subspace shows two different
behaviours. Under IN-CT, image tokens already carry semantic structure from the
vision encoder in the early layers, while text tokens have yet to form
meaningful representations. As text acquires semantics in the middle layers,
both modalities occupy narrow cones separated by the modality gap. Deeper in the
network these cones progressively merge, and by the final layers the two share a
representational space. Under the layer-wise paradigms there is no such
convergence, and image representations stay orthogonal to the language space
throughout, which follows from their discontinuous evolution since nothing there
reshapes them toward it.
<figure>
  <img src="/projects/hidden-evolution/fig5-pca-attention.png" alt="PCA subspaces of image and text tokens at five layers for each integration style, attention mass over system, image and text tokens across layers, and gate values across layers." />
  <figcaption>(a) Image and text tokens projected into a shared PCA subspace at layers 1, 6, 12, 18 and 23. (b) Attention mass on system, image and text tokens across layers, on CV-Bench 3D and OCR-Bench. (c) Gate values across layers for the NeXT and OV recipes.</figcaption>
</figure>
Attention mass measures how much of a generated token's attention falls on
visual tokens at each layer. On general tasks it decreases with depth, so
visual tokens are used mainly in the shallow layers, but on text-centric tasks
it stays high throughout, so utilisation is task-dependent.
LW-AT distributes attention much as IN-CT does, since both let visual and text
tokens interact in the same attention, yet IN-CT still performs better. In LW-GC
the visual contribution is set instead by fixed learned gates that do not adapt
to the input, which is why LW-AT stays ahead of it. Attention allocation alone
therefore does not explain the gap. What differs is the quality of the visual
representation each layer has to work with.


## Hybrid integration

<div class="split">
<figure>
  <img src="/projects/hidden-evolution/fig7-hybrid.png" alt="Radar plots comparing the hybrid integration against the individual integration styles." />
  <figcaption>The hybrid, interleaving layer-wise attention injection with in-context tokens, compared against each individual paradigm across the same benchmarks.</figcaption>
</figure>

<div>

IN-CT and LW-AT capture complementary frequency characteristics, IN-CT
progressively building high-frequency representations while LW-AT maintains
low-frequency ones. To test whether both can be used at once, we combine them in a
hybrid model, interleaving layer-wise attention injection before the in-context
tokens with a one-to-one token mapping. The hybrid outperforms every other
paradigm across most benchmarks, showing that a VLM benefits from access to both
high-frequency and low-frequency visual features.

</div>
</div>

## Takeaways

We compared in-context and layer-wise integration under identical training
conditions. Under in-context injection, visual tokens evolve smoothly across
layers, shifting toward high-frequency detail before converging with the
language space, while under layer-wise injection they evolve discontinuously,
stay low-frequency and remain orthogonal to it. The performance gap comes from
the quality of these representations, not from how much attention the image
receives, and combining both paradigms recovers the strengths of each.
 
While our study focuses on the vision-language setting, we believe these
findings are relevant to the broader MLLM community. Different modalities may
inherently benefit from different frequency characteristics, and understanding
which integration paradigm best preserves the frequency properties critical to
each modality could inform the design of more effective multimodal systems.
