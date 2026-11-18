import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Home from "./pages/Home";
import HomeMobile from "./pages/HomeMobile";
import MobileMenu, { type MenuTarget } from "./pages/MobileMenu";
import Case1 from "./pages/Case1";
import Case2 from "./pages/Case2";
import Case3 from "./pages/Case3";
import Case4 from "./pages/Case4";
import Case5 from "./pages/Case5";
import Case6 from "./pages/Case6";
import Case7 from "./pages/Case7";

// Page order follows the Figma prototype ("Next Button" flow: 01 -> 07 -> 01).
const CASES = [
  { slug: "spare-a-car", Page: Case1 },
  { slug: "corporate-website", Page: Case2 },
  { slug: "real-estate", Page: Case3 },
  { slug: "travel-agency", Page: Case4 },
  { slug: "exploria", Page: Case5 },
  { slug: "car-rental", Page: Case6 },
  { slug: "ecommerce", Page: Case7 },
];

// Card / tile names in the design -> case-study slug.
const CARD_TARGETS: Record<string, string> = {
  "CaseCard/Exploria": "exploria",
  "CaseCard/Spare-a-Car": "spare-a-car",
  "CaseCard/Real Estate Corporate Website": "real-estate",
  "ProjectTile/Corporate Official Website": "corporate-website",
  "ProjectTile/Car Rental Website Landing Page": "car-rental",
  "ProjectTile/Travel Agency Landing Page": "travel-agency",
  "ProjectTile/E-commerce Website": "ecommerce",
};

const DESIGN_WIDTH = 1440;
const FLUID_MAX = 1099; // below this width pages reflow instead of scaling
let pendingSection: string | null = null;

const SECTION_SELECTORS: Record<string, string> = {
  work: '[data-name="Featured"]',
  services: '[data-name="Services"], [data-name="Skills"]',
  skills: '[data-name="Skills"]',
  experience: '[data-name="Experience"]',
  contact: '[data-name="Footer/Main"], [data-name="Contact"]',
};

function goHome(section?: string) {
  pendingSection = section ?? null;
  if (window.location.hash) window.location.hash = "";
  else runPending();
}

function runPending() {
  const target = pendingSection;
  pendingSection = null;
  requestAnimationFrame(() => {
    if (target)
      document
        .querySelector(SECTION_SELECTORS[target])
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function scrollToSection(section: string, onHome: boolean) {
  if (section === "contact" || onHome) {
    document
      .querySelector(SECTION_SELECTORS[section])
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else goHome(section);
}

function openCase(slug: string) {
  window.location.hash = slug;
  window.scrollTo({ top: 0 });
}

/* ---------- scroll-triggered animation configuration ---------- */
const REVEALS: [string, string][] = [
  ['[data-name="Hero Text"]', "left"],
  ['[data-name="Hero Visual"]', "right"],
  ['[data-name="Hero Block"]', "scale"],
  ['[data-name="Logo Band"]', "up"],
  ['[data-name="Left"]', "left"],
  ['[data-name="Right"]', "right"],
  ['[data-name="Header"]', "up"],
  ['[data-name^="CaseCard/"]', "up"],
  ['[data-name^="Service/"]', "up"],
  ['[data-name^="ToolCard/"]', "scale"],
  ['[data-name="Principles Block"]', "scale"],
  ['[data-name^="Item 0"]', "right"],
  ['[data-name="Intro"]', "left"],
  ['[data-name^="Role/"]', "right"],
  ['[data-name="Education"]', "up"],
  ['[data-name="Filters"]', "up"],
  ['[data-name^="ProjectTile/"]', "scale"],
  ['[data-name="Placeholder Tile"]', "scale"],
  ['[data-name^="Step 0"]', "up"],
  ['[data-name="Contact Block"]', "scale"],
  ['[data-name="Project Details"] [data-name^="Detail "]', "up"],
  ['[data-name="Full-page Showcase"]', "scale"],
  ['[data-name="Screens Box"]', "scale"],
  ['[data-name="Admin Dashboard Showcase"]', "scale"],
  ['[data-name^="Section Hero"]', "up"],
  ['[data-name^="Section Content"]', "up"],
  ['[data-name^="Section Closing"]', "up"],
  ['[data-name="Decision"]', "scale"],
  ['[data-name="Conclusion Block"]', "scale"],
  ['[data-name="Next Project"]', "up"],
  ['[data-name="Footer Bar"]', "up"],
  ['[data-name="Giant Name"]', "up"],
];

const PARALLAX: [string, number][] = [
  ['[data-name="Dashboard"]', -0.08],
  ['[data-name="Phone"]', 0.1],
  ['[data-name="Float/Skill"]', -0.05],
  ['[data-name="Float/Now"]', 0.07],
  ['[data-name="Cover"]', -0.03],
  ['[data-name="Hero Visual"] [data-name="Mock"]', -0.05],
  ['[data-name="Giant Name"] p', -0.06],
];

function usePageBehavior(rootRef: React.RefObject<HTMLDivElement | null>, onHome: boolean) {
  useLayoutEffect(() => {
    const root = rootRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    /* --- reveal setup (before paint, so nothing flashes) --- */
    const revealed = new Set<HTMLElement>();
    REVEALS.forEach(([sel, anim]) =>
      root.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        if (revealed.has(el)) return;
        revealed.add(el);
        el.setAttribute("data-reveal", "");
        el.setAttribute("data-anim", anim);
      }),
    );
    const groups = new Map<Element, HTMLElement[]>();
    revealed.forEach((el) =>
      groups.set(el.parentElement!, [...(groups.get(el.parentElement!) ?? []), el]),
    );
    groups.forEach(
      (els) =>
        els.length > 1 &&
        els.forEach((el, i) => el.style.setProperty("--d", `${Math.min(i, 6) * 110}ms`)),
    );

    const stats = [...root.querySelectorAll<HTMLElement>('[data-name="Stat"] p:first-child')];
    stats.forEach((p) => {
      p.dataset.target = p.textContent ?? "0";
      if (!reduce && /^\d+$/.test(p.dataset.target)) p.textContent = "0";
    });
    const countUp = (p: HTMLElement) => {
      const target = parseInt(p.dataset.target ?? "", 10);
      if (Number.isNaN(target)) return;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - t0) / 1300, 1);
        p.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.add("is-visible");
          if (!reduce)
            el.querySelectorAll<HTMLElement>('[data-name="Stat"] p:first-child').forEach(countUp);
          io.unobserve(el);
        }),
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );
    revealed.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    /* --- seamless marquees: measure one repeat period of the duplicated track --- */
    root.querySelectorAll<HTMLElement>('[data-name="Track"]').forEach((track) => {
      const kids = [...track.children] as HTMLElement[];
      const j = kids.findIndex(
        (k, i) => i > 0 && k.tagName === kids[0].tagName && k.textContent === kids[0].textContent,
      );
      if (j > 0) {
        track.style.setProperty("--period", `${kids[j].offsetLeft - kids[0].offsetLeft}px`);
        track.classList.add("marquee-track");
        const big = !!track.closest('[data-name="Loop/BigMarquee"]');
        track.style.setProperty("--dur", big ? "22s" : "18s");
      }
    });

    /* --- scroll-linked: parallax, nav shrink, progress --- */
    const para = PARALLAX.flatMap(([sel, speed]) =>
      [...root.querySelectorAll<HTMLElement>(sel)].map((el) => ({ el, speed })),
    );
    const nav = root.querySelector<HTMLElement>('[data-name="Nav/Header"]');
    const navs = [
      ...root.querySelectorAll<HTMLElement>('[data-name="Nav/Header"], [data-name="Nav"]'),
    ];
    let lastY = window.scrollY;
    const bar = document.querySelector<HTMLElement>(".scroll-progress");
    let raf = 0;
    const frame = () => {
      raf = 0;
      const vh = window.innerHeight;
      nav?.classList.toggle("nav-scrolled", window.scrollY > 80);
      // hide the nav while scrolling down, bring it back on any scroll up
      const y = window.scrollY;
      if (y <= 80) navs.forEach((n) => n.classList.remove("nav-hidden"));
      else if (Math.abs(y - lastY) > 6) {
        const hide = y > lastY;
        navs.forEach((n) => n.classList.toggle("nav-hidden", hide));
      }
      if (Math.abs(y - lastY) > 6 || y <= 80) lastY = y;
      if (bar)
        bar.style.transform = `scaleX(${window.scrollY / Math.max(document.documentElement.scrollHeight - vh, 1)})`;
      if (reduce) return;
      para.forEach(({ el, speed }) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) return;
        el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * speed).toFixed(1)}px`;
      });
    };
    const onScroll = () => !raf && (raf = requestAnimationFrame(frame));
    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    });

    /* --- clicks: navigation, CTAs, form --- */
    const caseIndex = CASES.findIndex((c) => c.slug === window.location.hash.slice(1));
    const submitTimers: number[] = [];
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const named = (n: string) => t.closest(`[data-name="${n}"]`);
      const prefixed = t.closest<HTMLElement>(
        '[data-name^="CaseCard/"], [data-name^="ProjectTile/"]',
      );
      if (prefixed) return openCase(CARD_TARGETS[prefixed.dataset.name!]);
      if (named("Home Active")) return goHome();
      if (named("NavLink/Work") || named("Btn/CaseStudies")) return scrollToSection("work", onHome);
      if (named("NavLink/Services")) return scrollToSection("services", onHome);
      if (named("NavLink/Contact") || named("Btn/CV") || named("Btn/Talk"))
        return scrollToSection("contact", onHome);
      if (named("Btn/LinkedIn"))
        return void window.open("https://www.linkedin.com", "_blank", "noopener");
      if (named("Btn/Behance")) return void window.open("https://t.me", "_blank", "noopener");
      if (named("Back Link")) return goHome("work");
      if (named("Next Button")) return openCase(CASES[(caseIndex + 1) % CASES.length].slug);
      if (named("Back To Top")) return void window.scrollTo({ top: 0, behavior: "smooth" });
      const send = named("Button/Send") as HTMLElement | null;
      if (send) {
        if (send.classList.contains("is-busy")) return;
        const form = send.closest('[data-name="Contact Form"]')!;
        const fields = [
          ...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea"),
        ];
        let valid = true;
        fields.forEach((f) => {
          const ok =
            f.value.trim() !== "" && (f.type !== "email" || /^\S+@\S+\.\S+$/.test(f.value));
          f.closest('[data-name="Input"]')?.classList.toggle("field-error", !ok);
          if (!ok) valid = false;
        });
        if (!valid) return fields.find((f) => f.closest(".field-error"))?.focus();
        const label = send.querySelector<HTMLElement>("p")!;
        const original = label.textContent;
        send.classList.add("is-busy");
        label.textContent = "Sending…";
        submitTimers.push(
          window.setTimeout(() => {
            label.textContent = "Message sent";
            send.classList.replace("is-busy", "is-sent");
            fields.forEach((f) => (f.value = ""));
          }, 700),
          window.setTimeout(() => {
            label.textContent = original;
            send.classList.remove("is-sent");
          }, 3300),
        );
      }
    };
    const onInput = (e: Event) =>
      (e.target as HTMLElement).closest('[data-name="Input"]')?.classList.remove("field-error");
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    cleanups.push(() => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("input", onInput);
      submitTimers.forEach(clearTimeout);
    });

    if (onHome && pendingSection) runPending();
    return () => cleanups.forEach((fn) => fn());
  }, [onHome, rootRef]);
}

/* Keeps the 1440px design pixel-exact; scales it down uniformly on narrower screens. */
function Scaler({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    // CSS zoom scales the layout itself, so position: sticky (the nav) keeps working;
    // a transform: scale() would make the sticky nav drift away from the viewport top.
    const useZoom = CSS.supports("zoom", "1");
    const fit = () => {
      const s = Math.min(1, window.innerWidth / DESIGN_WIDTH);
      const el = inner.current!;
      if (useZoom) {
        el.style.zoom = s < 1 ? String(s) : "";
        return;
      }
      el.style.transform = s < 1 ? `scale(${s})` : "none";
      outer.current!.style.height = `${el.offsetHeight * s}px`;
    };
    fit();
    const ro = useZoom ? null : new ResizeObserver(fit);
    ro?.observe(inner.current!);
    window.addEventListener("resize", fit);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);
  return (
    <div ref={outer} className="scaler-outer">
      <div ref={inner} className="scaler-inner" style={{ width: DESIGN_WIDTH }}>
        {children}
      </div>
    </div>
  );
}

function PageShell({ slug, children }: { slug: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  usePageBehavior(ref, slug === "");
  return <div ref={ref}>{children}</div>;
}

function useIsFluid() {
  const [m, setM] = useState(() => window.innerWidth <= FLUID_MAX);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${FLUID_MAX}px)`);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  // unitless viewport width for CSS calc() when scaling fixed-size mockups
  useEffect(() => {
    const set = () =>
      document.documentElement.style.setProperty(
        "--vw",
        String(document.documentElement.clientWidth),
      );
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
  return m;
}

const THEME_KEY = "theme";
function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggle = () =>
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  return { dark, toggle };
}

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      onClick={onToggle}
    >
      {dark ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />
        </svg>
      )}
    </button>
  );
}

export default function App() {
  const { dark, toggle } = useTheme();
  const [slug, setSlug] = useState(window.location.hash.slice(1));
  const [menuOpen, setMenuOpen] = useState(false);
  const mobile = useIsFluid();
  useEffect(() => {
    const update = () => {
      setSlug(window.location.hash.slice(1));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    if (!mobile) setMenuOpen(false);
  }, [mobile]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  const current = CASES.find((c) => c.slug === slug);
  const mobileHome = mobile && !current;

  // case-study pages: put a menu button into the (links-hidden) nav pill
  useEffect(() => {
    if (!mobile || !current) return;
    const pill = document.querySelector('[data-name="Nav Pill"]');
    if (!pill) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-btn";
    btn.setAttribute("aria-label", "Open menu");
    btn.innerHTML = "<span></span><span></span>";
    btn.addEventListener("click", () => setMenuOpen(true));
    pill.appendChild(btn);
    return () => btn.remove();
  }, [mobile, current]);

  const selectMenu = (t: MenuTarget) => {
    setMenuOpen(false);
    if (t === "Home")
      return current ? goHome() : void window.scrollTo({ top: 0, behavior: "smooth" });
    const key = t.toLowerCase();
    // wait for the overlay to unmount so body scrolling is restored first
    setTimeout(() => scrollToSection(key, !current), 30);
  };

  const menu = menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} onSelect={selectMenu} />;

  if (mobileHome)
    return (
      <>
        <div className="scroll-progress" />
        <ThemeToggle dark={dark} onToggle={toggle} />
        <PageShell key="mobile" slug="">
          <HomeMobile onOpenMenu={() => setMenuOpen(true)} />
        </PageShell>
        {menu}
      </>
    );

  const Page = current ? current.Page : Home;
  return (
    <>
      <div className="scroll-progress" />
      <ThemeToggle dark={dark} onToggle={toggle} />
      {mobile ? (
        <div className="fluid">
          <PageShell key={slug} slug={slug}>
            <Page />
          </PageShell>
        </div>
      ) : (
        <Scaler>
          <PageShell key={current ? slug : ""} slug={current ? slug : ""}>
            <Page />
          </PageShell>
        </Scaler>
      )}
      {menu}
    </>
  );
}
