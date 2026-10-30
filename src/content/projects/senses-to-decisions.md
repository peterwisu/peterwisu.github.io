---
title: "From Senses to Decisions: The Information Flow of Auditory and Visual Perception in Multimodal LLMs"
icon: "👁️👂"
description: "Tracing how audio and visual information is routed through audio-visual LLMs, and when those tokens stop being needed."
venue: "NeurIPS 2026"
authors:
  - { name: "Wish Suharitdamrong", url: "https://peterwisu.github.io", affiliation: "1" }
  - { name: "Muhammad Awais", url: "https://www.surrey.ac.uk/people/muhammad-awais", affiliation: "1,2" }
  - { name: "Xiatian Zhu", url: "https://www.surrey.ac.uk/people/xiatian-zhu", affiliation: "1,2" }
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
paper: "https://arxiv.org/abs/2606.10147"
# venue_site: ""
# repo: ""
citations:
  - label: "NeurIPS 2026"
    bibtex: |
      @inproceedings{suharitdamrong2026senses,
        title     = {From Senses to Decisions: The Information Flow of Auditory and Visual Perception in Multimodal LLMs},
        author    = {Suharitdamrong, Wish and Awais, Muhammad and Zhu, Xiatian and Atito, Sara},
        booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
        year      = {2026}
      }
references:
  - text: "Nguyen, P. L., et al. <em>See, Hear, and Understand: Benchmarking Audiovisual Human Speech Understanding in Multimodal Large Language Models</em> (AV-SpeakerBench). 2025."
    href: "https://arxiv.org/abs/2512.02231"
  - text: "Gong, K., et al. <em>AV-Odyssey Bench: Can Your Multimodal LLMs Really Understand Audio-Visual Information?</em> 2024."
    href: "https://arxiv.org/abs/2412.02611"
  - text: "Qwen Team. <em>Qwen2.5-Omni Technical Report</em>. 2025."
    href: "https://arxiv.org/abs/2503.20215"
date: 2026-09-24
draft: false
---

## Motivation

Audio-visual LLMs answer questions about video with sound. How the audio and the
video reach the answer inside the model has not been studied. There is
interpretability work on vision-language models and on video LLMs, but not on
models that take both audio and video.

We ask three questions. Does attention indicate where information flows? In a
single audio-visual video, how do the two modalities interact, and how does
their information reach the prediction? And with several interleaved images and
audio clips, how is information routed and how is the answer selected?

## Attention does not show where information goes

Attention is the obvious place to start. It can be read directly, without any
intervention, and most interpretability work uses it to say where information
goes. So we check first whether it does.

Looking at how the generated token allocates attention across layers, one
position dominates. The last token attends heavily to video tokens at layer 31,
and in the attention map these appear as bright vertical stripes that almost
every query attends to.

<figure>
  <img src="/projects/senses-to-decisions/attention-per-layer.gif" alt="Left: how the generated token allocates its attention across system, video, audio, user instruction and generated tokens, layer by layer. Right: the full attention map at the same layer, with query and key positions coloured by token type." />
  <figcaption>Left: where the generated token puts its attention, layer by layer, split by token type. Right: the attention map at the same layer. Bright vertical stripes mark positions that attract attention from almost every query.</figcaption>
</figure>

The hidden states show the same thing. A small number of video tokens carry much
larger norms than their neighbours, and that magnitude sits in a few dimensions
rather than being spread across them. These are sinks, with very large
activations, similar to the language sinks reported in LLMs.

<figure>
  <img src="/projects/senses-to-decisions/hidden-state-norms.gif" alt="Left: hidden-state L2 norm at each token position across layers, with system, video, audio and user instruction tokens coloured separately. Right: per-dimension magnitude for a system token and a video token, showing the video token concentrating its magnitude in a few hidden dimensions." />
  <figcaption>Left: hidden-state L2 norm at each token position, layer by layer. Right: magnitude across hidden dimensions for a system token and a video token. The video token puts most of its magnitude into a small number of dimensions.</figcaption>
</figure>

If attention indicated information flow, removing it should reduce accuracy. It
does not. Masking video and audio attention from layer 31 onward leaves accuracy
unchanged or slightly higher, 42.24 to 42.52. The large attention weights are on
tokens that are no longer contributing.

The rest of the analysis therefore uses causal interventions rather than
attention maps.

## Method

We use attention knockout, a causal intervention that blocks selected attention
edges inside a sliding window of seven layers. If blocking an edge changes the
answer, that edge was carrying information. We measure the relative change in
the probability of the predicted answer letter, and run the intervention only on
samples the model already answers correctly.

<div class="ko">
<input type="radio" name="ko" id="k-none" checked/>
<input type="radio" name="ko" id="k-vq"/>
<input type="radio" name="ko" id="k-aq"/>
<input type="radio" name="ko" id="k-ql"/>
<input type="radio" name="ko" id="k-vl"/>
<input type="radio" name="ko" id="k-al"/>
<input type="radio" name="ko" id="k-va"/>
<style>
  .ko { margin: 1.75rem 0; }
  .ko > input { position: absolute; opacity: 0; width: 0; height: 0; }
  .ko-tabs { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: .9rem; }
  .ko-tabs span { font-size: .72rem; color: #555; align-self: center; margin-right: .3rem; }
  :root.dark .ko-tabs span { color: #aaa; }
  .ko-tabs label { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: .72rem; letter-spacing: .04em; padding: .3rem .7rem; border: 1px solid var(--tn-border); border-radius: 999px; color: var(--tn-fg-dark); cursor: pointer; user-select: none; }
  .ko-tabs label:hover { color: var(--tn-fg); border-color: var(--tn-fg-dark); }
  .ko-edge { fill: none; stroke-width: 2.5; transition: opacity .25s ease; }
  .ko-x { opacity: 0; transition: opacity .25s ease; }
  .ko-bar { transform-origin: 577px 150px; transition: transform .35s ease; }
  .ko-out p { font-size: .85rem; line-height: 1.6; color: var(--tn-fg-dark); margin: .5rem 0 0; display: none; }
  #k-none:checked ~ .ko-tabs label[for="k-none"], #k-vq:checked ~ .ko-tabs label[for="k-vq"], #k-aq:checked ~ .ko-tabs label[for="k-aq"], #k-ql:checked ~ .ko-tabs label[for="k-ql"], #k-vl:checked ~ .ko-tabs label[for="k-vl"], #k-al:checked ~ .ko-tabs label[for="k-al"], #k-va:checked ~ .ko-tabs label[for="k-va"] { color: var(--tn-bg); background: var(--tn-fg); border-color: var(--tn-fg); }
  #k-vq:checked ~ svg .e-vq, #k-aq:checked ~ svg .e-aq, #k-ql:checked ~ svg .e-ql, #k-vl:checked ~ svg .e-vl, #k-al:checked ~ svg .e-al, #k-va:checked ~ svg .e-va { opacity: .12; }
  #k-vq:checked ~ svg .x-vq, #k-aq:checked ~ svg .x-aq, #k-ql:checked ~ svg .x-ql, #k-vl:checked ~ svg .x-vl, #k-al:checked ~ svg .x-al, #k-va:checked ~ svg .x-va { opacity: 1; }
  #k-vq:checked ~ svg .ko-bar { transform: scaleY(.68); }
  #k-aq:checked ~ svg .ko-bar { transform: scaleY(.76); }
  #k-ql:checked ~ svg .ko-bar { transform: scaleY(.3); }
  #k-vl:checked ~ svg .ko-bar { transform: scaleY(.97); }
  #k-al:checked ~ svg .ko-bar { transform: scaleY(.97); }
  #k-va:checked ~ svg .ko-bar { transform: scaleY(.82); }
  #k-none:checked ~ .ko-out .o-none, #k-vq:checked ~ .ko-out .o-vq, #k-aq:checked ~ .ko-out .o-aq, #k-ql:checked ~ .ko-out .o-ql, #k-vl:checked ~ .ko-out .o-vl, #k-al:checked ~ .ko-out .o-al, #k-va:checked ~ .ko-out .o-va { display: block; }
  .ko-lab { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; fill: #ffffff; }
  .ko-note { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 11px; fill: #555555; }
  :root.dark .ko-note { fill: #aaaaaa; }
  .ko-last { fill: #1f2933; }
  :root.dark .ko-last { fill: #c4ccd5; }
  :root.dark .ko-last-label { fill: #121212; }
</style>
<div class="ko-tabs"><span>block:</span><label for="k-none">nothing</label><label for="k-vq">V &#8594; Q</label><label for="k-aq">A &#8594; Q</label><label for="k-ql">Q &#8594; Last</label><label for="k-vl">V &#8594; Last</label><label for="k-al">A &#8594; Last</label><label for="k-va">V &#8596; A</label></div>
<svg viewBox="0 0 700 185" width="100%" role="img" aria-label="Interactive attention knockout. Blocking video or audio directly to the last token changes the answer barely at all, because no direct route exists. Blocking video or audio to the question, or the question to the last token, degrades the answer.">
  <defs><marker id="ko-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker></defs>
  <path class="ko-edge e-vl" d="M 92 36 C 220 -2, 350 8, 424 68" stroke="#2d7ff9" marker-end="url(#ko-arr)"/>
  <path class="ko-edge e-al" d="M 92 136 C 220 176, 350 166, 424 104" stroke="#f28c28" marker-end="url(#ko-arr)"/>
  <path class="ko-edge e-va" d="M 67 68 L 67 104" stroke="#e8202a" marker-start="url(#ko-arr)" marker-end="url(#ko-arr)"/>
  <path class="ko-edge e-vq" d="M 94 48 L 222 78" stroke="#2d7ff9" marker-end="url(#ko-arr)"/>
  <path class="ko-edge e-aq" d="M 94 124 L 222 94" stroke="#f28c28" marker-end="url(#ko-arr)"/>
  <path class="ko-edge e-ql" d="M 302 86 L 422 86" stroke="#0e8c99" marker-end="url(#ko-arr)"/>
  <g class="ko-x x-vq"><line x1="150" y1="55" x2="166" y2="71" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/><line x1="166" y1="55" x2="150" y2="71" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/></g>
  <g class="ko-x x-aq"><line x1="150" y1="101" x2="166" y2="117" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/><line x1="166" y1="101" x2="150" y2="117" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/></g>
  <g class="ko-x x-ql"><line x1="354" y1="78" x2="370" y2="94" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/><line x1="370" y1="78" x2="354" y2="94" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/></g>
  <g class="ko-x x-vl"><line x1="248" y1="4" x2="264" y2="20" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/><line x1="264" y1="4" x2="248" y2="20" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/></g>
  <g class="ko-x x-al"><line x1="248" y1="152" x2="264" y2="168" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/><line x1="264" y1="152" x2="248" y2="168" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/></g>
  <g class="ko-x x-va"><line x1="110" y1="78" x2="126" y2="94" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/><line x1="126" y1="78" x2="110" y2="94" stroke="#e8202a" stroke-width="3" stroke-linecap="round"/></g>
  <rect x="40" y="30" width="54" height="32" rx="5" fill="#2d7ff9"/>
  <text class="ko-lab" x="67" y="51" text-anchor="middle" fill="#ffffff" font-size="13">V</text>
  <rect x="40" y="110" width="54" height="32" rx="5" fill="#f28c28"/>
  <text class="ko-lab" x="67" y="131" text-anchor="middle" fill="#ffffff" font-size="13">A</text>
  <rect x="226" y="70" width="76" height="32" rx="5" fill="#0e8c99"/>
  <text class="ko-lab" x="264" y="91" text-anchor="middle" fill="#ffffff" font-size="13">Question</text>
  <rect x="424" y="70" width="76" height="32" rx="5" class="ko-last"/>
  <text class="ko-lab ko-last-label" x="462" y="91" text-anchor="middle" fill="#ffffff" font-size="13">Last</text>
  <rect class="ko-bar" x="560" y="40" width="34" height="110" rx="3" fill="#0e8c99"/>
  <text class="ko-note" x="577" y="168" text-anchor="middle" font-size="11">p(answer)</text>
</svg>
<div class="ko-out">
<p class="o-none">Nothing blocked. The last token reaches the answer through the question, which has already taken what it needs from video and audio.</p>
<p class="o-vq">Video can no longer reach the question. Accuracy drops, most on tasks that depend on what is seen.</p>
<p class="o-aq">Audio can no longer reach the question. Accuracy drops, most on tasks that depend on what is heard.</p>
<p class="o-ql">The question can no longer reach the last token. This edge carries the whole route, so accuracy drops sharply.</p>
<p class="o-vl">Little changes. There is no direct route from the video tokens to the last token.</p>
<p class="o-al">Little changes. There is no direct route from the audio tokens to the last token either.</p>
<p class="o-va">The two modalities can no longer inform each other. The cost falls on tasks that need them aligned, such as speech recognition and speaker detection.</p>
</div>
</div>

The main model is Qwen2.5-Omni 3B <a href="#ref-3" class="cite">[3]</a>.
Qwen2.5-Omni 7B and Video-SALMONN2 Plus at 3B and 7B are used to check that the
findings hold across models and scales.

## Single video: one sequential route

For a single audio-visual video we use AV-SpeakerBench
<a href="#ref-1" class="cite">[1]</a>, a four-way multiple-choice benchmark with
five task categories grouped by which modality informs which.

<figure>
<svg viewBox="0 0 700 92" width="100%" role="img" aria-label="Token layout for a single audio-visual video: a system prompt, then video and audio tokens interleaved in time windows, then the question and options, then the last token where the answer is predicted.">
  <style>
    .tok { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; fill: #ffffff; }
    .tokcap { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 11px; font-style: italic; fill: #555555; }
    :root.dark .tokcap { fill: #aaaaaa; }
    .tokdots { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 15px; fill: #555555; }
    :root.dark .tokdots { fill: #aaaaaa; }
    .toklast { fill: #1f2933; }
    :root.dark .toklast { fill: #c4ccd5; }
    :root.dark .toklast-label { fill: #121212; }
  </style>
  <rect x="0" y="16" width="100" height="34" rx="5" fill="#8cb43a"/>
  <text class="tok" x="50" y="38" text-anchor="middle" fill="#ffffff" font-size="13">System</text>
  <rect x="110" y="16" width="44" height="34" rx="5" fill="#2d7ff9"/>
  <text class="tok" x="132" y="38" text-anchor="middle" fill="#ffffff" font-size="13">V<tspan dy="3" font-size="9">1</tspan></text>
  <rect x="160" y="16" width="44" height="34" rx="5" fill="#f28c28"/>
  <text class="tok" x="182" y="38" text-anchor="middle" fill="#ffffff" font-size="13">A<tspan dy="3" font-size="9">1</tspan></text>
  <rect x="210" y="16" width="44" height="34" rx="5" fill="#2d7ff9"/>
  <text class="tok" x="232" y="38" text-anchor="middle" fill="#ffffff" font-size="13">V<tspan dy="3" font-size="9">2</tspan></text>
  <rect x="260" y="16" width="44" height="34" rx="5" fill="#f28c28"/>
  <text class="tok" x="282" y="38" text-anchor="middle" fill="#ffffff" font-size="13">A<tspan dy="3" font-size="9">2</tspan></text>
  <text class="tokdots" x="322" y="39" text-anchor="middle" font-size="15">...</text>
  <rect x="340" y="16" width="44" height="34" rx="5" fill="#2d7ff9"/>
  <text class="tok" x="362" y="38" text-anchor="middle" fill="#ffffff" font-size="13">V<tspan dy="3" font-size="9">C</tspan></text>
  <rect x="390" y="16" width="44" height="34" rx="5" fill="#f28c28"/>
  <text class="tok" x="412" y="38" text-anchor="middle" fill="#ffffff" font-size="13">A<tspan dy="3" font-size="9">C</tspan></text>
  <rect x="444" y="16" width="156" height="34" rx="5" fill="#0e8c99"/>
  <text class="tok" x="522" y="38" text-anchor="middle" fill="#ffffff" font-size="13">Question + options</text>
  <rect x="610" y="16" width="86" height="34" rx="5" class="toklast"/>
  <text class="tok toklast-label" x="653" y="38" text-anchor="middle" fill="#ffffff" font-size="13">Last</text>
  <text class="tokcap" x="272" y="68" text-anchor="middle" font-size="11">interleaved in time windows</text>
  <text class="tokcap" x="653" y="68" text-anchor="middle" font-size="11">answer predicted here</text>
</svg>
  <figcaption>Token layout for a single audio-visual video, from AV-SpeakerBench. Video and audio tokens alternate in time windows, followed by the question and its options, then the last token.</figcaption>
</figure>

Attention across frames matters for nearly every task. Two-way interaction
between audio and video matters most on tasks that need fine-grained alignment
between them, such as speech recognition and speaker detection. Interaction
between audio tokens has little effect.

The route to the prediction is sequential. The modalities pass information to
the question tokens, and the question passes it to the last token. Which
modality contributes depends on the task: visual tasks route mostly through the
video, and audio-heavy tasks draw on both.

<figure>
<svg viewBox="0 0 624 260" width="100%" role="img" aria-label="Information flow in a single audio-visual video. Video and audio tokens each exchange information within themselves and with each other, then pass information to the question tokens, which pass it to the last token.">
  <style>
    .s2d-label { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; fill: #ffffff; }
    .s2d-note  { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 12px; fill: #555555; }
    :root.dark .s2d-note { fill: #aaaaaa; }
    .s2d-last  { fill: #1f2933; }
    :root.dark .s2d-last { fill: #c4ccd5; }
    :root.dark .s2d-last-label { fill: #121212; }
    .s2d-edge { fill: none; stroke-width: 3; }
    .s2d-dash { stroke-dasharray: 9 9; animation: s2d-march 1.4s linear infinite; }
    .s2d-d2 { animation-delay: .35s; }
    .s2d-d3 { animation-delay: .7s; }
    @keyframes s2d-march { to { stroke-dashoffset: -18; } }
    .s2d-comet { stroke-dasharray: 26 170; stroke-dashoffset: 26; stroke-linecap: round; animation: s2d-comet 2.8s linear infinite; }
    @keyframes s2d-comet { to { stroke-dashoffset: -170; } }
    .s2d-pulse { animation: s2d-travel 2.8s linear infinite; }
    @keyframes s2d-travel { from { offset-distance: 0%; } to { offset-distance: 100%; } }
    @media (prefers-reduced-motion: reduce) {
      .s2d-dash, .s2d-pulse, .s2d-comet { animation: none; }
      .s2d-pulse, .s2d-comet { opacity: 0; }
    }
  </style>
  <defs>
    <marker id="s2d-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/>
    </marker>
  </defs>
  <path class="s2d-edge s2d-dash" d="M 38 20 L 8 20 L 8 60 L 32 60" stroke="#9b30b5" marker-end="url(#s2d-arrow)"/>
  <path class="s2d-edge s2d-dash" d="M 38 200 L 8 200 L 8 240 L 32 240" stroke="#1565c0" marker-end="url(#s2d-arrow)"/>
  <path class="s2d-edge s2d-dash s2d-d2" d="M 73 172 L 73 88" stroke="#e8202a" marker-start="url(#s2d-arrow)" marker-end="url(#s2d-arrow)"/>
  <path class="s2d-edge s2d-dash s2d-d2" d="M 123 50 L 287 108" stroke="#9b30b5" marker-end="url(#s2d-arrow)"/>
  <path class="s2d-edge s2d-dash s2d-d2" d="M 123 220 L 287 181" stroke="#1565c0" marker-end="url(#s2d-arrow)"/>
  <path class="s2d-edge s2d-d3" d="M 383 140 L 527 140" stroke="#ff8c1a" marker-end="url(#s2d-arrow)"/>
  <path class="s2d-edge s2d-comet" d="M 383 140 L 527 140" stroke="#ffd79a"/>
  <circle class="s2d-pulse" r="5" fill="#9b30b5" style="offset-path: path('M 123 50 L 287 108');"/>
  <circle class="s2d-pulse" r="5" fill="#1565c0" style="offset-path: path('M 123 220 L 287 181'); animation-delay: .2s;"/>
  <circle cx="73" cy="40" r="40" fill="#2d7ff9"/>
  <circle cx="73" cy="220" r="40" fill="#f28c28"/>
  <circle cx="338" cy="140" r="40" fill="#0e8c99"/>
  <circle class="s2d-last" cx="583" cy="140" r="40"/>
  <text class="s2d-label" x="73" y="45" text-anchor="middle" fill="#ffffff" font-size="13">Video</text>
  <text class="s2d-label" x="73" y="225" text-anchor="middle" fill="#ffffff" font-size="13">Audio</text>
  <text class="s2d-label" x="338" y="145" text-anchor="middle" fill="#ffffff" font-size="13">Question</text>
  <text class="s2d-label s2d-last-label" x="583" y="145" text-anchor="middle" fill="#ffffff" font-size="13">Last</text>
  <path class="s2d-edge s2d-dash" d="M 333 40 L 379 40" stroke="#888888"/>
  <text class="s2d-note" x="388" y="44" font-size="12">dashed: flow strength is task-dependent</text>
</svg>
  <figcaption>The route in a single audio-visual video. Each modality attends within itself, audio and video exchange information with each other, both pass information to the question tokens, and the question passes it to the last token.</figcaption>
</figure>


## Interleaved inputs: two parallel routes

For multiple interleaved inputs we use the matching subset of AV-Odyssey
<a href="#ref-2" class="cite">[2]</a>, where one reference item is matched
against four candidates.

<figure>
<svg viewBox="0 0 700 92" width="100%" role="img" aria-label="Token layout for interleaved inputs: a system prompt, four candidate images, then the question, the reference audio and the option letters, then the last token.">
  <style>
    .tk { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; fill: #ffffff; }
    .tksub { font-size: 9px; }
    .tkcap { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 11px; font-style: italic; fill: #555555; }
    :root.dark .tkcap { fill: #aaaaaa; }
    .tkdots { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 15px; fill: #555555; }
    :root.dark .tkdots { fill: #aaaaaa; }
    .tklast { fill: #1f2933; }
    :root.dark .tklast { fill: #c4ccd5; }
    :root.dark .tklast-label { fill: #121212; }
  </style>
  <rect x="0" y="16" width="100" height="34" rx="5" fill="#8cb43a"/>
  <text class="tk" x="50" y="38" text-anchor="middle" fill="#ffffff" font-size="13">System</text>
  <rect x="110" y="16" width="50" height="34" rx="5" fill="#7a8794"/>
  <text class="tk" x="135" y="38" text-anchor="middle" fill="#ffffff" font-size="13">img</text>
  <rect x="166" y="16" width="50" height="34" rx="5" fill="#7a8794"/>
  <text class="tk" x="191" y="38" text-anchor="middle" fill="#ffffff" font-size="13">img</text>
  <rect x="222" y="16" width="50" height="34" rx="5" fill="#7a8794"/>
  <text class="tk" x="247" y="38" text-anchor="middle" fill="#ffffff" font-size="13">img</text>
  <rect x="278" y="16" width="50" height="34" rx="5" fill="#7a8794"/>
  <text class="tk" x="303" y="38" text-anchor="middle" fill="#ffffff" font-size="13">img</text>
  <rect x="338" y="16" width="44" height="34" rx="5" fill="#0e8c99"/>
  <text class="tk" x="360" y="38" text-anchor="middle" fill="#ffffff" font-size="13">Q</text>
  <rect x="388" y="16" width="74" height="34" rx="5" fill="#6c4ab6"/>
  <text class="tk" x="425" y="38" text-anchor="middle" fill="#ffffff" font-size="13">audio</text>
  <rect x="468" y="16" width="44" height="34" rx="5" fill="#9b7fd6"/>
  <text class="tk" x="490" y="38" text-anchor="middle" fill="#ffffff" font-size="13">O<tspan class="tksub" dy="3" font-size="9">1</tspan></text>
  <text class="tkdots" x="530" y="39" text-anchor="middle" font-size="15">...</text>
  <rect x="548" y="16" width="44" height="34" rx="5" fill="#9b7fd6"/>
  <text class="tk" x="570" y="38" text-anchor="middle" fill="#ffffff" font-size="13">O<tspan class="tksub" dy="3" font-size="9">4</tspan></text>
  <rect x="610" y="16" width="86" height="34" rx="5" class="tklast"/>
  <text class="tk tklast-label" x="653" y="38" text-anchor="middle" fill="#ffffff" font-size="13">Last</text>
  <text class="tkcap" x="219" y="68" text-anchor="middle" font-size="11">4 candidates</text>
  <text class="tkcap" x="465" y="68" text-anchor="middle" font-size="11">reference + option letters</text>
</svg>
  <figcaption>Token layout for interleaved inputs, from the AV-Odyssey matching subset. Four candidate images, then the question, the reference item and the option letters, then the last token.</figcaption>
</figure>

The routing differs from the single-video case. Candidates and question pass
information to the reference, and the reference passes it to the last token. The
candidates also exchange information among themselves at the middle layers.

Answer selection runs through the option letters. The correct option letter
aggregates information from the correct candidate. At the late layers the
correct and incorrect option letters compete, and blocking the incorrect ones
increases accuracy.

<figure>
<svg viewBox="0 0 609 241" width="100%" role="img" aria-label="Information flow with interleaved inputs. Candidates exchange information among themselves, then pass it to the reference and to the options, while the question also passes to the reference. The reference and the options each pass information to the last token.">
  <style>
    .s2e-label { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; fill: #ffffff; }
    .s2e-small { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 11px; fill: #ffffff; }
    .s2e-last { fill: #1f2933; }
    :root.dark .s2e-last { fill: #c4ccd5; }
    :root.dark .s2e-last-label { fill: #121212; }
    .s2e-edge { fill: none; stroke-width: 3; }
    .s2e-comet { fill: none; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 12 100; stroke-dashoffset: 12; animation: s2e-run 2.6s linear infinite; }
    .s2e-late { animation-delay: 1.1s; }
    @keyframes s2e-run { to { stroke-dashoffset: -100; } }
    @media (prefers-reduced-motion: reduce) { .s2e-comet { animation: none; opacity: 0; } }
  </style>
  <defs>
    <marker id="s2e-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/>
    </marker>
  </defs>
  <path class="s2e-edge" pathLength="100" d="M 38 170 L 8 170 L 8 210 L 32 210" stroke="#9b30b5" marker-end="url(#s2e-arrow)"/>
  <path class="s2e-comet" pathLength="100" d="M 38 170 L 8 170 L 8 210 L 32 210" stroke="#d9a7e8"/>
  <path class="s2e-edge" pathLength="100" d="M 118 40 L 272 40" stroke="#2ca02c" marker-end="url(#s2e-arrow)"/>
  <path class="s2e-comet" pathLength="100" d="M 118 40 L 272 40" stroke="#9fe09f"/>
  <path class="s2e-edge" pathLength="100" d="M 138 170 L 272 84" stroke="#1565c0" marker-end="url(#s2e-arrow)"/>
  <path class="s2e-comet" pathLength="100" d="M 138 170 L 272 84" stroke="#9ec6f2"/>
  <path class="s2e-edge" pathLength="100" d="M 138 195 L 272 195" stroke="#2ca02c" marker-end="url(#s2e-arrow)"/>
  <path class="s2e-comet" pathLength="100" d="M 138 195 L 272 195" stroke="#9fe09f"/>
  <path class="s2e-edge" pathLength="100" d="M 368 40 L 521 97" stroke="#f020d0" marker-end="url(#s2e-arrow)"/>
  <path class="s2e-comet s2e-late" pathLength="100" d="M 368 40 L 521 97" stroke="#ffa6ef"/>
  <path class="s2e-edge" pathLength="100" d="M 368 201 L 521 162" stroke="#ff8c1a" marker-end="url(#s2e-arrow)"/>
  <path class="s2e-comet s2e-late" pathLength="100" d="M 368 201 L 521 162" stroke="#ffd79a"/>
  <circle cx="58" cy="170" r="20" fill="#7a8794"/>
  <circle cx="108" cy="170" r="20" fill="#7a8794"/>
  <circle cx="58" cy="221" r="20" fill="#7a8794"/>
  <circle cx="108" cy="221" r="20" fill="#7a8794"/>
  <text class="s2e-small" x="58" y="174" text-anchor="middle" fill="#ffffff" font-size="11">C1</text>
  <text class="s2e-small" x="108" y="174" text-anchor="middle" fill="#ffffff" font-size="11">C2</text>
  <text class="s2e-small" x="58" y="225" text-anchor="middle" fill="#ffffff" font-size="11">C3</text>
  <text class="s2e-small" x="108" y="225" text-anchor="middle" fill="#ffffff" font-size="11">C4</text>
  <circle cx="68" cy="40" r="40" fill="#0e8c99"/>
  <circle cx="323" cy="40" r="40" fill="#6c4ab6"/>
  <circle cx="323" cy="195" r="40" fill="#9b7fd6"/>
  <circle class="s2e-last" cx="568" cy="130" r="40"/>
  <text class="s2e-label" x="68" y="45" text-anchor="middle" fill="#ffffff" font-size="13">Question</text>
  <text class="s2e-label" x="323" y="45" text-anchor="middle" fill="#ffffff" font-size="13">Reference</text>
  <text class="s2e-label" x="323" y="200" text-anchor="middle" fill="#ffffff" font-size="13">Options</text>
  <text class="s2e-label s2e-last-label" x="568" y="135" text-anchor="middle" fill="#ffffff" font-size="13">Last</text>
</svg>
  <figcaption>The route with interleaved inputs. Candidates exchange information among themselves, then pass it to the reference and to the options, while the question also feeds the reference. The reference and the options then reach the last token by separate paths.</figcaption>
</figure>

The sequential route found for single videos is therefore not the general case.
With interleaved inputs the model uses two parallel paths.
