import { useState } from "react";

export interface Frame {
  src: string;
  /** Shown next to the slider, e.g. a layer index or timestep. */
  label: string;
  caption?: string;
}

interface Props {
  frames: Frame[];
  /** Name of the thing being swept, e.g. "Layer" or "Timestep". */
  name?: string;
}

/**
 * Sweep through a stack of figures with a slider — the standard interpretability
 * widget (attention maps per layer, activations per step, ablation sweeps).
 *
 * Usage from an .mdx project page:
 *   <FigureSlider client:visible name="Layer" frames={[{src: "...", label: "1"}]} />
 *
 * Colours come from the site's CSS variables, so it tracks light/dark for free.
 */
export default function FigureSlider({ frames, name = "Step" }: Props) {
  const [i, setI] = useState(0);
  if (frames.length === 0) return null;
  const frame = frames[i];

  return (
    <figure style={{ margin: "1.75rem 0" }}>
      <img
        src={frame.src}
        alt={frame.caption ?? `${name} ${frame.label}`}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          border: "1px solid var(--tn-border)",
          borderRadius: 4,
          margin: 0,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.9rem",
          marginTop: "0.9rem",
        }}
      >
        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--tn-fg-dark)",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>

        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          aria-label={name}
          style={{ flex: 1, accentColor: "var(--tn-fg)" }}
        />

        {/* Fixed width so the row doesn't jitter as the label changes */}
        <span
          style={{
            fontSize: "0.8rem",
            fontFamily: "var(--font-mono)",
            color: "var(--tn-fg)",
            minWidth: "3ch",
            textAlign: "right",
          }}
        >
          {frame.label}
        </span>
      </div>

      {frame.caption && (
        <figcaption style={{ marginTop: "0.6rem" }}>{frame.caption}</figcaption>
      )}
    </figure>
  );
}
