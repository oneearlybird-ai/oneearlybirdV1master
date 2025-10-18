import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function Section({ id, eyebrow, title, description, children, className }: SectionProps) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 md:py-24 ${className ?? ""}`}>
      <div className="mx-auto max-w-3xl text-center md:text-left">
        {eyebrow ? <span className="stellar-badge mb-5">{eyebrow}</span> : null}
        {title ? <h2 className="stellar-section-title text-3xl leading-tight text-white md:text-4xl">{title}</h2> : null}
        {description ? <p className="mt-4 text-base text-white/70 md:text-lg">{description}</p> : null}
      </div>
      <div className={title || description ? "mt-10" : ""}>{children}</div>
    </section>
  );
}
