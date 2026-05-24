import { useState, useEffect, useRef } from "react";
import type { FC, ReactNode, CSSProperties } from "react";
import { SiReact, SiTypescript, SiTailwindcss, SiGithub, SiFastly } from "react-icons/si";
import { FaLinkedin, FaCode, FaBolt, FaWandMagicSparkles, FaWhatsapp } from "react-icons/fa6";
/* ─────────────────────────── Types ─────────────────────────── */

interface CounterProps {
  target: number;
  suffix?: string;
}

interface TypewriterProps {
  words: string[];
}

interface NavProps {
  active: string;
  go: (id: string) => void;
}

interface SectionProps {
  id: string;
  children: ReactNode;
  style?: CSSProperties;
}

interface HeadingProps {
  text: string;
}

interface BentoCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  highlight?: boolean;
  delay?: number;
}

interface SkillCardProps {
  icon: ReactNode;
  name: string;
  pct: number;
  color: string;
  delay?: number;
}

interface PerfBarProps {
  label: string;
  value: string;
  pct: number;
  gradient: string;
  delay?: number;
}

interface ContactLinkProps {
  icon: ReactNode;
  label: string;
  color: string;
  url: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
}

interface Segment {
  pct: number;
  color: string;
  label: string;
}

interface ArcSegment extends Segment {
  dash: number;
  offset: number;
  i: number;
}

interface StatItem {
  val: string;
  label: string;
  color: string;
}

/* ─────────────────────────── useInView ─────────────────────────── */

function useInView(): [React.RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, inView];
}

/* ─────────────────────────── Counter ─────────────────────────── */

const Counter: FC<CounterProps> = ({ target, suffix = "" }) => {
  const [count, setCount] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0, rootMargin: "0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let cur = 0;
    const step = target / 80;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 20);
    return () => clearInterval(t);
  }, [started, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─────────────────────────── Particles ─────────────────────────── */

const Particles: FC = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const COLORS: string[] = ["#00bcd4", "#76ff03", "#a855f7"];

    const pts: Particle[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.4,
      c: COLORS[Math.floor(Math.random() * 3)],
    }));

    let raf: number;

    const draw = (): void => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.55;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = "#00bcd4";
            ctx.globalAlpha = (1 - d / 110) * 0.13;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    draw();

    const onResize = (): void => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.7 }}
    />
  );
};

/* ─────────────────────────── Typewriter ─────────────────────────── */

const Typewriter: FC<TypewriterProps> = ({ words }) => {
  const [idx, setIdx] = useState<number>(0);
  const [txt, setTxt] = useState<string>("");
  const [del, setDel] = useState<boolean>(false);

  useEffect(() => {
    const word = words[idx % words.length];
    const speed = del ? 45 : 90;
    const to = setTimeout(() => {
      if (!del) {
        const next = word.slice(0, txt.length + 1);
        setTxt(next);
        if (next === word) setTimeout(() => setDel(true), 1100);
      } else {
        const next = word.slice(0, txt.length - 1);
        setTxt(next);
        if (next === "") { setDel(false); setIdx((i) => i + 1); }
      }
    }, speed);
    return () => clearTimeout(to);
  });

  return (
    <span style={{ color: "#00bcd4", fontFamily: "'Space Mono', monospace" }}>
      {txt}
      <span style={{ borderRight: "2px solid #00bcd4", animation: "blink 1s step-end infinite" }} />
    </span>
  );
};

/* ─────────────────────────── Navbar ─────────────────────────── */

const Nav: FC<NavProps> = ({ active, go }) => {
  const links: string[] = ["Home", "Features", "Stack", "Performance", "Timeline", "Contact"];
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const fn = (): void => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Tutup sidebar saat klik di luar
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      if (!target.closest("#sidebar") && !target.closest("#hamburger")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const handleNav = (l: string): void => {
    go(l);
    setOpen(false);
  };

  return (
    <>
      {/* ── Navbar Bar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5vw",
        background: scrolled ? "rgba(10,15,30,0.92)" : "rgba(10,15,30,0.4)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,188,212,0.1)",
        transition: "all 0.4s",
      }}>
        {/* Logo */}
        <div style={{ fontWeight: 900, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
          <span style={{ color: "#fff" }}>MY</span>
          <span style={{ background: "linear-gradient(90deg,#00bcd4,#76ff03)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            PORTOFOLIO
          </span>
        </div>

        {/* Hamburger Button */}
        <button
          id="hamburger"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{
            cursor: "pointer",
            display: "flex", flexDirection: "column", justifyContent: "center",
            alignItems: "center", gap: 5, width: 40, height: 40,
            borderRadius: 10, padding: "6px 8px",
            background: open ? "rgba(0,188,212,0.12)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${open ? "rgba(0,188,212,0.4)" : "rgba(255,255,255,0.1)"}`,
            transition: "all 0.3s",
          } as CSSProperties}
        >
          {/* 3 garis hamburger dengan animasi transform ke X */}
          <span style={{
            display: "block", width: 20, height: 2, borderRadius: 2,
            background: open ? "#00bcd4" : "rgba(255,255,255,0.8)",
            transform: open ? "translateY(7px) rotate(45deg)" : "none",
            transition: "all 0.3s ease",
          }} />
          <span style={{
            display: "block", width: 20, height: 2, borderRadius: 2,
            background: open ? "#00bcd4" : "rgba(255,255,255,0.8)",
            opacity: open ? 0 : 1,
            transition: "all 0.3s ease",
          }} />
          <span style={{
            display: "block", width: 20, height: 2, borderRadius: 2,
            background: open ? "#00bcd4" : "rgba(255,255,255,0.8)",
            transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
            transition: "all 0.3s ease",
          }} />
        </button>
      </nav>

      {/* ── Overlay gelap di belakang sidebar ── */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 250,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      />

      {/* ── Sidebar ── */}
      <aside
        id="sidebar"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 300,
          width: 280,
          background: "rgba(5,8,20,0.97)",
          backdropFilter: "blur(30px)",
          borderLeft: "1px solid rgba(0,188,212,0.15)",
          boxShadow: open ? "-20px 0 60px rgba(0,0,0,0.6)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(.23,1,.32,1)",
          display: "flex", flexDirection: "column",
          padding: "80px 0 40px",
          overflowY: "auto",
        }}
      >
        {/* Label kecil di atas */}
        <div style={{
          padding: "0 2rem 1.5rem",
          fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.25em",
          color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          marginBottom: "1rem",
        }}>
          Navigasi
        </div>

        {/* Menu Items */}
        {links.map((l, i) => (
          <button
            key={l}
            onClick={() => handleNav(l)}
            style={{
              cursor: "pointer",
              textAlign: "left", padding: "0.9rem 2rem",
              color: active === l ? "#00bcd4" : "rgba(255,255,255,0.6)",
              fontWeight: active === l ? 800 : 400,
              fontSize: "1rem", letterSpacing: "0.08em",
              textTransform: "uppercase", fontFamily: "inherit",
              border: "none",
              borderLeft: active === l ? "3px solid #00bcd4" : "3px solid transparent",
              background: active === l ? "rgba(0,188,212,0.06)" : "transparent",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", gap: "1rem",
              width: "100%",
            } as CSSProperties}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#00bcd4";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,188,212,0.05)";
            }}
            onMouseLeave={(e) => {
              if (active !== l) {
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }
            }}
          >
            {/* Nomor urut */}
            <span style={{
              fontSize: "0.65rem", color: active === l ? "#00bcd4" : "rgba(255,255,255,0.2)",
              fontFamily: "'Space Mono', monospace", minWidth: 20,
            }}>
              0{i + 1}
            </span>
            {l}
          </button>
        ))}

        {/* Footer sidebar */}
        <div style={{
          marginTop: "auto", padding: "1.5rem 2rem 0",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          fontSize: "0.7rem", color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.1em",
        }}>
          © 2025 VIBRANTPULSE
        </div>
      </aside>
    </>
  );
};

/* ─────────────────────────── Section ─────────────────────────── */

const Section: FC<SectionProps> = ({ id, children, style = {} }) => {
  const [ref, inView] = useInView();

  return (
    <section
      id={id}
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "90px 7vw 60px",
        position: "relative", zIndex: 1,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(50px)",
        transition: "opacity 0.85s ease, transform 0.85s ease",
        ...style,
      }}
    >
      {children}
    </section>
  );
};

/* ─────────────────────────── Heading ─────────────────────────── */

const Heading: FC<HeadingProps> = ({ text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
    <div style={{ width: 4, height: 36, background: "linear-gradient(180deg,#76ff03,#00bcd4)", borderRadius: 4 }} />
    <h2 style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>{text}</h2>
  </div>
);

/* ─────────────────────────── BentoCard ─────────────────────────── */

const BentoCard: FC<BentoCardProps> = ({ icon, title, desc, highlight = false, delay = 0 }) => {
  const [ref, inView] = useInView();
  const [hov, setHov] = useState<boolean>(false);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: 240, padding: "2rem", borderRadius: 20,
        background: hov ? "rgba(0,188,212,0.07)" : "rgba(255,255,255,0.03)",
        border: `1.5px solid ${highlight ? (hov ? "#76ff03" : "#76ff0355") : (hov ? "#00bcd488" : "rgba(255,255,255,0.08)")}`,
        transform: inView ? (hov ? "translateY(-6px)" : "none") : "translateY(40px)",
        opacity: inView ? 1 : 0,
        transition: `all 0.5s ease ${delay}ms`,
        boxShadow: hov ? "0 20px 40px rgba(0,0,0,0.3)" : "none",
        cursor: "default",
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "1rem", display: "flex", alignItems: "center" }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.75rem" }}>{title}</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
};

/* ─────────────────────────── SkillCard ─────────────────────────── */

const SkillCard: FC<SkillCardProps> = ({ icon, name, pct, color, delay = 0 }) => {
  const [ref, inView] = useInView();
  const [hov, setHov] = useState<boolean>(false);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: 200, padding: "2rem", borderRadius: 20,
        background: hov ? `${color}09` : "rgba(255,255,255,0.04)",
        border: `1.5px solid ${hov ? color : "rgba(255,255,255,0.08)"}`,
        transform: inView ? (hov ? "translateY(-8px) scale(1.02)" : "none") : "translateY(40px)",
        opacity: inView ? 1 : 0,
        transition: `all 0.5s ease ${delay}ms`,
        boxShadow: hov ? `0 0 40px ${color}22` : "none",
        cursor: "default",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem", color, display: "flex", alignItems: "center" }}>{icon}</div>
      <div style={{ fontWeight: 700, marginBottom: "1.2rem", fontSize: "1.1rem" }}>{name}</div>
      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 100, height: 7, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 100,
          background: `linear-gradient(90deg,${color},${color}99)`,
          width: inView ? `${pct}%` : "0%",
          boxShadow: `0 0 14px ${color}88`,
          transition: `width 1.4s cubic-bezier(.23,1,.32,1) ${delay + 200}ms`,
        }} />
      </div>
      <div style={{ textAlign: "right", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginTop: 6 }}>{pct}%</div>
    </div>
  );
};

/* ─────────────────────────── PerfBar ─────────────────────────── */

const PerfBar: FC<PerfBarProps> = ({ label, value, pct, gradient, delay = 0 }) => {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        marginBottom: "1.8rem",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateX(-30px)",
        transition: `all 0.6s ease ${delay}ms`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 100, height: 10, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 100, background: gradient,
          width: inView ? `${pct}%` : "0%",
          transition: `width 1.5s cubic-bezier(.23,1,.32,1) ${delay + 200}ms`,
          boxShadow: "0 0 20px rgba(0,188,212,0.35)",
        }} />
      </div>
    </div>
  );
};

/* ─────────────────────────── Donut ─────────────────────────── */

const Donut: FC = () => {
  const [ref, inView] = useInView();
  const [hov, setHov] = useState<number | null>(null);

  const R = 72, cx = 88, cy = 88;
  const circ = 2 * Math.PI * R;

  const segs: Segment[] = [
    { pct: 40, color: "#00bcd4", label: "Core Logic & TS Architecture" },
    { pct: 30, color: "#76ff03", label: "UI/UX & Tailwind Styling" },
    { pct: 30, color: "#a855f7", label: "Animations & Interactivity" },
  ];

  let off = 0;
  const arcs: ArcSegment[] = segs.map((s, i) => {
    const dash = (s.pct / 100) * circ;
    const a: ArcSegment = { ...s, dash, offset: -(off / 100) * circ, i };
    off += s.pct;
    return a;
  });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ display: "flex", alignItems: "center", gap: "3rem", flexWrap: "wrap" }}
    >
      <svg
        width={176} height={176} viewBox="0 0 176 176"
        style={{ opacity: inView ? 1 : 0, transition: "opacity 0.8s" }}
      >
        {arcs.map((a) => (
          <circle
            key={a.i} cx={cx} cy={cy} r={R}
            fill="none" stroke={a.color}
            strokeWidth={hov === a.i ? 30 : 26}
            strokeDasharray={inView ? `${a.dash} ${circ - a.dash}` : `0 ${circ}`}
            strokeDashoffset={a.offset}
            onMouseEnter={() => setHov(a.i)}
            onMouseLeave={() => setHov(null)}
            style={{
              transition: `stroke-dasharray 1.2s ease ${a.i * 180}ms, stroke-width 0.2s`,
              cursor: "pointer",
              opacity: hov === null || hov === a.i ? 1 : 0.5,
            }}
          />
        ))}
        <text x={cx} y={cy - 7} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={8} fontWeight={700} letterSpacing={1}>PORTFOLIO</text>
        <text x={cx} y={cy + 7} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={8} fontWeight={700} letterSpacing={1}>BUILD</text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {segs.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateX(20px)",
            transition: `all 0.5s ease ${300 + i * 150}ms`,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem" }}>{s.label} ({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────── Table ─────────────────────────── */

const Table: FC = () => {
  const [ref, inView] = useInView();
  const rows: [string, string, string][] = [
    ["Type Safety", "None (Loose)", "Strict (TypeScript)"],
    ["Reusability", "Low (Copy-Paste)", "High (Components)"],
    ["Animations", "Static / Basic", "Fluid / Framer Motion"],
    ["Bundle Size", "Large", "Optimized (Vite)"],
  ];

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20, overflow: "hidden", marginTop: "2rem",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(30px)",
        transition: "all 0.7s ease",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(0,188,212,0.05)" }}>
        {["Feature", "Old Way (HTML/PHP)", "New Way (React + TS)"].map((h, i) => (
          <div key={i} style={{ padding: "1rem 1.5rem", color: "#00bcd4", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em" }}>{h}</div>
        ))}
      </div>
      {rows.map(([f, o, n], ri) => (
        <div
          key={ri}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,188,212,0.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{ padding: "0.9rem 1.5rem", color: "rgba(255,255,255,0.75)", fontSize: "0.88rem" }}>{f}</div>
          <div style={{ padding: "0.9rem 1.5rem", color: "rgba(255,255,255,0.35)", fontSize: "0.88rem" }}>{o}</div>
          <div style={{ padding: "0.9rem 1.5rem", color: "#76ff03", fontSize: "0.88rem", fontWeight: 600 }}>{n}</div>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────── ContactLink ─────────────────────────── */

const ContactLink: FC<ContactLinkProps> = ({ icon, label, color }) => {
  const [hov, setHov] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}
    >
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: hov ? color : "rgba(255,255,255,0.05)",
        border: `2px solid ${hov ? color : "rgba(255,255,255,0.1)"}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
        transform: hov ? "translateY(-4px) scale(1.1)" : "none",
        transition: "all 0.3s ease",
        boxShadow: hov ? `0 0 30px ${color}55` : "none",
      }}>
        {icon}
      </div>
      <span style={{ color: hov ? "#fff" : "rgba(255,255,255,0.45)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.12em", transition: "color 0.2s" }}>
        {label}
      </span>
    </div>
  );
};

/* ═══════════════════════════ MAIN APP ═══════════════════════════ */

const VibrantPulse: FC = () => {
  const [activeNav, setActiveNav] = useState<string>("Home");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; overflow-x: hidden; }
      body { background: #0a0f1e; color: #fff; font-family:sans-serif; overflow-x: hidden; margin: 0; }
      button { font-family: inherit; }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes gradshift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: #0a0f1e; }
      ::-webkit-scrollbar-thumb { background: #00bcd4; border-radius: 10px; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const go = (id: string): void => {
    setActiveNav(id);
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  const statItems: Array<{ n: number; suf: string; label: string; color: string }> = [
    { n: 99,  suf: "",    label: "Lighthouse Score", color: "#00bcd4" },
    { n: 0,   suf: ".8s", label: "Load Speed",       color: "#76ff03" },
    { n: 92,  suf: "%",   label: "Code Efficiency",  color: "#a855f7" },
  ];

  const badgeItems: StatItem[] = [
    { val: "99",  label: "Lighthouse",     color: "#00bcd4" },
    { val: "A+",  label: "Security",       color: "#76ff03" },
    { val: "25M+",label: "Prompts Created",color: "#a855f7" },
  ];

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", overflowX: "hidden" }}>
      <Particles />
      <Nav active={activeNav} go={go} />

      {/* ══ HERO ══ */}
      <section id="home" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        position: "relative", zIndex: 1, padding: "80px 5vw 60px",
        boxSizing: "border-box", width: "100%",
        background: "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(0,188,212,0.09) 0%, transparent 70%)",
      }}>
        <div style={{
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.28em",
          color: "#76ff03", padding: "6px 18px", borderRadius: 100,
          background: "rgba(118,255,3,0.07)", border: "1px solid rgba(118,255,3,0.2)",
          marginBottom: "1.5rem",
        }}>
          ✦ NEXT-GEN PORTFOLIO CONCEPT ✦
        </div>

        <h1 style={{ fontSize: "clamp(2.8rem,7vw,6rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>
          <span style={{ color: "#fff" }}>MY</span>
          <span style={{
            backgroundImage: "linear-gradient(135deg,#00bcd4 0%,#3b82f6 40%,#06b6d4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundSize: "200%", animation: "gradshift 4s ease infinite",
          }}>
            PORTOFOLIO
          </span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.05rem", maxWidth: 480, lineHeight: 1.75, marginBottom: 6 }}>
          Built with{" "}
          <Typewriter words={["React + TypeScript", "Tailwind CSS", "Framer Motion", "Vite + React Compiler"]} />
        </p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem", marginBottom: "3rem" }}>
          Designed for the modern web, optimized for the dream of ITB.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "4rem" }}>
          <button
            onClick={() => go("Features")}
            style={{
              background: "linear-gradient(135deg,#00bcd4,#0284c7)",
              border: "none", padding: "14px 34px", borderRadius: 100,
              color: "#fff", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.12em",
              cursor: "pointer", transition: "all 0.3s",
              boxShadow: "0 0 30px rgba(0,188,212,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 50px rgba(0,188,212,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 30px rgba(0,188,212,0.35)"; }}
          >
            INTERACT NOW ↓
          </button>
          <button
            onClick={() => go("Stack")}
            style={{
              background: "transparent", border: "1.5px solid rgba(255,255,255,0.15)",
              padding: "14px 34px", borderRadius: 100,
              color: "rgba(255,255,255,0.65)", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.1em",
              cursor: "pointer", transition: "all 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#76ff03"; e.currentTarget.style.color = "#76ff03"; e.currentTarget.style.boxShadow = "0 0 20px rgba(118,255,3,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            VIEW STACK
          </button>
        </div>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
          {statItems.map(({ n, suf, label, color }) => (
            <div key={label} style={{
              textAlign: "center", padding: "1rem 2rem",
              background: "rgba(255,255,255,0.03)", borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color }}>
                {suf === ".8s" ? "0.8s" : <><Counter target={n} />{suf}</>}
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <Section id="features">
        <Heading text="Modular Bento Experience" />
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <BentoCard icon={<FaCode color="#00bcd4" />} title="Clean TS Code" desc="Type-safe components using TypeScript for maximum reliability and fewer bugs." delay={0} />
          <BentoCard icon={<FaBolt color="#76ff03" />} title="Fast Performance" desc="React Compiler ready. Lighthouse score 99+ guaranteed by optimized logic." highlight delay={150} />
          <BentoCard icon={<FaWandMagicSparkles color="#a855f7" />} title="Smooth UX" desc="Interactive animations using Framer Motion that react to user engagement." delay={300} />
        </div>
        <Table />
      </Section>

      {/* ══ STACK ══ */}
      <Section id="stack">
        <Heading text="The Powerhouse Stack" />
        <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "2rem", fontSize: "0.9rem" }}>Hover to reveal skill depth</p>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "4rem" }}>
          <SkillCard icon={<SiReact />}       name="React JS"     pct={90} color="#00bcd4" delay={0}   />
          <SkillCard icon={<SiTypescript />}  name="TypeScript"   pct={82} color="#3b82f6" delay={150} />
          <SkillCard icon={<SiTailwindcss />} name="Tailwind CSS" pct={88} color="#76ff03" delay={300} />
        </div>
        <Heading text="Development Time Allocation" />
        <Donut />
      </Section>

      {/* ══ PERFORMANCE ══ */}
      <Section id="performance" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(118,255,3,0.04) 0%, transparent 70%)" }}>
        <Heading text="Performance Benchmark" />
        <div style={{ maxWidth: 680 }}>
          <PerfBar label="Loading Speed"      value="0.8s" pct={96} gradient="linear-gradient(90deg,#a855f7,#00bcd4)" delay={0}   />
          <PerfBar label="Code Efficiency"    value="92%"  pct={92} gradient="linear-gradient(90deg,#76ff03,#16a34a)" delay={150} />
          <PerfBar label="User Interactivity" value="High" pct={85} gradient="linear-gradient(90deg,#a855f7,#7c3aed)" delay={300} />
        </div>
        <div style={{ display: "flex", gap: "2rem", marginTop: "3rem", flexWrap: "wrap" }}>
          {badgeItems.map(({ val, label, color }) => (
            <div key={label} style={{
              padding: "1.5rem 2.5rem", borderRadius: 16,
              background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`,
              textAlign: "center",
            }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 900, color }}>{val}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ══ TIMELINE ══ */}
<section id="timeline" style={{ padding: "8rem 2rem", position: "relative" }}>
  <Heading text="ROAD TO ITB PROFESSOR" />
  
  {/* Pembungkus Konten Utama (Flexbox 2 Kolom) */}
  <div style={{ 
    display: "flex", 
    gap: "3rem", 
    flexWrap: "wrap", 
    alignItems: "center", 
    marginTop: "4rem" 
  }}>
    
    {/* KOLOM KIRI: Cerita & Code Snippet Kamu */}
    <div style={{ flex: 1, minWidth: "320px" }}>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "2rem" }}>
        Dari kelas 7 SMP, konsisten latihan sprint setiap sore dan ngulik React di malam hari. 
        Target masa depan: Menembus <span style={{ color: "#00bcd4", fontWeight: 700 }}>ITB</span> dan mengejar gelar Profesor di bidang IT!
      </p>

      {/* Snippet Code SprintDev Bawaan Kamu */}
      <div style={{
        background: "rgba(10,15,30,0.7)", 
        border: "1px solid rgba(0,188,212,0.2)", 
        borderRadius: 16, 
        padding: "1.5rem", 
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.85rem", 
        color: "#76ff03", 
        borderLeft: "4px solid #00bcd4",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
      }}>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>// The Workspace & Spirit</span><br />
        <span style={{ color: "#a855f7" }}>const</span> <span style={{ color: "#00bcd4" }}>SprintDev</span> = () =&gt; &#123;<br />
        &nbsp;&nbsp;std.<span style={{ color: "#76ff03" }}>speed</span> = <span style={{ color: "#f59e0b" }}>"MAX_SPRINT"</span>;<br />
        &nbsp;&nbsp;target.<span style={{ color: "#76ff03" }}>campus</span> = <span style={{ color: "#f59e0b" }}>"ITB_GANESHA"</span>;<br />
        &nbsp;&nbsp;<span style={{ color: "#a855f7" }}>return</span> <span style={{ color: "#00bcd4" }}>&lt;ProfessorDegree /&gt;</span>;<br />
        &#125;;
      </div>
    </div>

    {/* KOLOM KANAN: "VIDEO" ANIMASI GERBANG ITB MURNI KODE KELAS DEWA */}
    <div style={{ 
      flex: 1, 
      minWidth: "320px", 
      height: "350px", 
      background: "linear-gradient(to bottom, #050814, #0a0f24)",
      borderRadius: 24, 
      overflow: "hidden", 
      position: "relative",
      border: "1px solid rgba(0,188,212,0.15)",
      boxShadow: "0 25px 50px -12px rgba(0,188,212,0.25)",
    }}>
      
      {/* Efek Kamera Bergerak (Cinematic Container) */}
      <div style={{ 
        width: "100%", 
        height: "100%", 
        position: "relative",
        animation: "cinematicZoom 12s infinite ease-in-out"
      }}>
        
        {/* 1. Langit Malam & Bintang-bintang Kedip */}
        <div style={{ position: "absolute", top: "20%", left: "15%", width: 3, height: 3, background: "#fff", borderRadius: "50%", animation: "starTwinkle 3s infinite 0.5s" }} />
        <div style={{ position: "absolute", top: "35%", left: "75%", width: 2, height: 2, background: "#fff", borderRadius: "50%", animation: "starTwinkle 2s infinite 1s" }} />
        <div style={{ position: "absolute", top: "15%", left: "50%", width: 4, height: 4, background: "#00bcd4", borderRadius: "50%", animation: "starTwinkle 4s infinite" }} />

        {/* 2. Siluet Gedung Aula Barat ITB Atap Nyentrik (Background) */}
        <div style={{
          position: "absolute", bottom: "15%", left: "50%", transform: "translateX(-50%)",
          width: "220px", height: "0",
          borderLeft: "110px solid transparent", borderRight: "110px solid transparent",
          borderBottom: "70px solid rgba(15, 23, 42, 0.9)", zIndex: 1
        }} />
        {/* Ornamen Atap Bertumpuk khas ITB */}
        <div style={{
          position: "absolute", bottom: "32%", left: "50%", transform: "translateX(-50%)",
          width: "160px", height: "0",
          borderLeft: "80px solid transparent", borderRight: "80px solid transparent",
          borderBottom: "45px solid rgba(30, 41, 59, 0.8)", zIndex: 2
        }} />

        {/* 3. Sorotan Lampu Neon Estetik Utama (Ciri Khas Masa Depan) */}
        <div style={{
          position: "absolute", bottom: "15%", left: "50%", transform: "translateX(-50%)",
          width: "140px", height: "4px", background: "linear-gradient(to right, #00bcd4, #76ff03)",
          zIndex: 3, borderRadius: 2, animation: "neonPulse 3s infinite ease-in-out"
        }} />

        {/* 4. Tulisan Akrilik Menyala "ITB" */}
        <div style={{
          position: "absolute", bottom: "40%", left: "50%", transform: "translateX(-50%)",
          fontFamily: "'Space Mono', monospace", fontWeight: 900, fontSize: "2rem",
          color: "#fff", letterSpacing: "6px", textShadow: "0 0 10px #00bcd4, 0 0 30px #76ff03",
          zIndex: 4, animation: "neonPulse 3s infinite ease-in-out"
        }}>
          ITB
        </div>

        {/* 5. Efek Kabut Cahaya Ganesha (Glow Overlay) */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
          background: "linear-gradient(to top, #0a0f24, transparent)", zIndex: 5
        }} />
        
      </div>

      {/* Label Pojok Kiri Atas ala Video Recorder Kamera HP */}
      <div style={{
        position: "absolute", top: 15, left: 15, background: "rgba(0,0,0,0.6)",
        padding: "4px 10px", borderRadius: 8, fontSize: "0.7rem", color: "#fff",
        fontFamily: "monospace", display: "flex", alignItems: "center", gap: 6, zIndex: 10
      }}>
        <div style={{ width: 6, height: 6, background: "#ef4444", borderRadius: "50%", animation: "starTwinkle 1s infinite" }} />
        REC • TARGET_CAMPUS
      </div>

    </div>
  </div>
</section>

      {/* ══ CONTACT ══ */}
      <Section id="contact" style={{
        alignItems: "center", textAlign: "center",
        background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,188,212,0.06) 0%, transparent 70%)",
      }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.25em", color: "#76ff03", marginBottom: "1.5rem" }}>
          READY TO COLLABORATE?
        </div>
        <h2 style={{ fontSize: "clamp(2.5rem,6vw,5.5rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "1rem" }}>
          LET&apos;S
          <span style={{ background: "linear-gradient(135deg,#00bcd4,#76ff03)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            BUILD.
          </span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", marginBottom: "3rem", maxWidth: 420 }}>
          Ready to ship high-performance UI to Fastwork? Let&apos;s make something unforgettable.
        </p>
        <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          <ContactLink icon={<SiGithub />}   label="GITHUB"   color="#6e7681" />
          <ContactLink icon={<FaLinkedin />} label="LINKEDIN" color="#0077b5" />
          <ContactLink icon={<SiFastly />}   label="FASTWORK" color="#00bcd4" />
          <ContactLink icon={<FaWhatsapp />} label="WHATSAPP" color="#25d366" />
        </div>
        <div style={{ marginTop: "5rem", color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
          © 2025 VIBRANTPULSE · Built with React + TypeScript + Tailwind
        </div>
      </Section>
    </div>
  );
};

export default VibrantPulse;