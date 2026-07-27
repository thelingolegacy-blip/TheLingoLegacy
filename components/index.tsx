import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ChildrenProps = {
  children: ReactNode;
};

export function Button({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="ll-button" {...props}>
      {children}
    </button>
  );
}

export function Card({ children }: ChildrenProps) {
  return <section className="ll-card">{children}</section>;
}

export function Section({ title, children }: ChildrenProps & { title: string }) {
  return (
    <section className="ll-section">
      <p className="ll-eyebrow">Operational layer</p>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function CommandTile({ name, description }: { name: string; description: string }) {
  return (
    <article className="ll-command-tile">
      <h3>{name}</h3>
      <p>{description}</p>
    </article>
  );
}

export function XPBurst({ amount }: { amount: number }) {
  return <span className="ll-xp-burst">+{amount} XP</span>;
}
