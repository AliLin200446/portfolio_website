import Link from "next/link";
import type { ComponentProps, CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Measure } from "@/components/folio/FolioChrome";
import styles from "./editorial.module.css";

export { styles as editorialStyles };
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(" ");
type BoxProps = HTMLAttributes<HTMLDivElement>;
type DesktopSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type TabletSpan = 1 | 2 | 3 | 4 | 5 | 6;

/** Width and gutters only: the caller owns main/section semantics and vertical rhythm. */
export function PageContainer({ className, ...props }: BoxProps) {
  return <div {...props} className={classes(styles.container, className)} />;
}

export function EditorialGrid({ className, ...props }: BoxProps) {
  return <div {...props} className={classes(styles.grid, className)} />;
}

/** DOM order is reading order. Unspecified smaller-screen spans become full width. */
export function GridSpan({ columns = 12, tablet = 6, mobile = 2, className, style, ...props }: BoxProps & {
  columns?: DesktopSpan;
  tablet?: TabletSpan;
  mobile?: 1 | 2;
}) {
  return <div {...props} className={classes(styles.span, className)} style={{
    "--span-desktop": columns, "--span-tablet": tablet, "--span-mobile": mobile, ...style,
  } as CSSProperties} />;
}

export function Rule({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr {...props} className={classes(styles.rule, className)} />;
}

export function SectionHeader({ title, index, aside, id, level = 2, rule = "before" }: {
  title: ReactNode;
  index?: string;
  aside?: ReactNode;
  /** ID belongs to the heading, for aria-labelledby on its owning section. */
  id?: string;
  level?: 2 | 3;
  rule?: "before" | "after";
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return <header className={classes(styles.sectionHeader, rule === "before" ? styles.ruleBefore : styles.ruleAfter)}>
    <Heading id={id} className={styles.label}>{index && `${index} / `}{title}</Heading>
    {aside != null && <div className={styles.meta}>{aside}</div>}
  </header>;
}

export function EditorialIntro({ primary, supporting, split = 5 }: {
  primary: ReactNode;
  supporting: ReactNode;
  split?: 4 | 5 | 6 | 8;
}) {
  return <EditorialGrid>
    <GridSpan columns={split}>{primary}</GridSpan>
    <GridSpan columns={(12 - split) as DesktopSpan}>{supporting}</GridSpan>
  </EditorialGrid>;
}

/** Internal routes use Next navigation. External links stay same-tab unless requested. */
export function TextLink({ children, href, className, target, rel, ...props }: ComponentProps<typeof Link>) {
  const external = typeof href === "string" && /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href);
  return <Link {...props} href={href} target={target}
    rel={target === "_blank" ? `${rel ?? ""} noopener noreferrer`.trim() : rel}
    className={classes(styles.textLink, className)}>
    {children} <span aria-hidden="true">{external ? "↗" : "→"}</span>
    {target === "_blank" && <span className="sr-only"> (opens in a new tab)</span>}
  </Link>;
}

/** Supply intrinsic image/video dimensions, or an aspectRatio for canvas/live media. */
export function MediaFrame({ children, caption, aspectRatio, className, ...props }: HTMLAttributes<HTMLElement> & {
  caption?: ReactNode;
  aspectRatio?: CSSProperties["aspectRatio"];
}) {
  return <figure {...props} className={classes(styles.mediaFrame, className)}>
    <div className={classes(styles.mediaSurface, aspectRatio ? styles.containedMedia : undefined)} style={{ aspectRatio }}>{children}</div>
    {caption != null && <figcaption className={styles.caption}>{caption}</figcaption>}
  </figure>;
}

/** Compact alternative for future cases; existing CaseHero remains the full instrument intro. */
export function ProjectIntro({ title, type, description, significance, role, stack, year, status, media }: {
  title: string;
  type?: string;
  description: ReactNode;
  significance?: ReactNode;
  role?: ReactNode;
  stack?: ReactNode;
  year?: ReactNode;
  status?: ReactNode;
  media?: ReactNode;
}) {
  const facts = [["Role", role], ["Stack", stack], ["Year", year], ["Status", status]] as const;
  return <header className={styles.stack}>
    <EditorialIntro primary={<div className={styles.stack}>
      {type && <p className={styles.label}>{type}</p>}
      <h1 className={styles.display}>{title}</h1>
    </div>} supporting={<div className={styles.stack}>
      <Measure><div className={styles.lead}>{description}</div></Measure>
      {significance && <Measure><div className={styles.body}>{significance}</div></Measure>}
      {facts.some(([, value]) => value != null) && <dl className={styles.facts}>{facts.map(([label, value]) => value != null && <div key={label}>
        <dt className={styles.label}>{label}</dt><dd className={styles.meta}>{value}</dd>
      </div>)}</dl>}
    </div>} />
    {media}
  </header>;
}

export function ExperimentGrid({ className, ...props }: BoxProps) {
  return <div {...props} className={classes(styles.experimentGrid, className)} />;
}

/** Keep live controls outside links; only the title navigates. Use a consistent media ratio per index. */
export function ExperimentCell({ title, href, meta, children }: {
  title: string;
  href?: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return <article className={styles.experimentCell}>
    <div className={styles.specimen}>{children}</div>
    <div className={styles.cellCaption}>
      <h3 className={styles.label}>{href ? <TextLink href={href}>{title}</TextLink> : title}</h3>
      {meta && <p className={styles.meta}>{meta}</p>}
    </div>
  </article>;
}
