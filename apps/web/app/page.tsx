import {
  Badge,
  Card,
  IdentityChip,
  PrivacyChip,
  VerificationBadge,
  VisibilityChip,
} from '@together/design-system';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <Badge tone="rose">Stage 0 foundation</Badge>
          <h1 id="hero-title">Real people.<br />Brighter connections.</h1>
          <p>
            together is being built around verified humans, private relationship intelligence,
            meaningful compatibility, and user-controlled visibility—not endless swiping.
          </p>
          <div className="hero-actions">
            <Link className="link-button link-button--primary" href="/health-demo">Check platform health</Link>
            <Link className="link-button" href="/system">View system shell</Link>
          </div>
        </div>
        <Card className="principles-card" selected>
          <p className="eyebrow">Foundation principle</p>
          <h2>Private from other users. Accountable to the platform.</h2>
          <p className="muted">
            Privacy, identity isolation, consent, verification, safety, and financial integrity are architectural boundaries.
          </p>
          <div className="chip-row">
            <VerificationBadge>Verified Human</VerificationBadge>
            <PrivacyChip>Privacy-first</PrivacyChip>
            <IdentityChip>Main identity</IdentityChip>
            <VisibilityChip>Visible by choice</VisibilityChip>
          </div>
        </Card>
      </section>
      <section className="three-grid" aria-label="Stage 0 web foundations">
        <Card><p className="eyebrow">Responsive</p><h2>One shell, every viewport</h2><p className="muted">Mobile-first layout with comfortable desktop expansion and keyboard-visible focus.</p></Card>
        <Card><p className="eyebrow">Accessible</p><h2>Semantics before decoration</h2><p className="muted">Landmarks, skip navigation, reduced-motion handling, contrast gates, and automated axe checks.</p></Card>
        <Card><p className="eyebrow">Safe</p><h2>No backend secrets in the browser</h2><p className="muted">Only explicitly public configuration crosses the client boundary.</p></Card>
      </section>
    </>
  );
}
