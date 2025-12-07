// We avoid external classnames dependency.  Compose classes manually.

export type MembershipTier = 'MEMBER' | 'BRONZE' | 'SILVER' | 'GOLD';

interface TierBadgeProps {
  tier: MembershipTier;
}

export default function TierBadge({ tier }: TierBadgeProps) {
  const label = tier.charAt(0) + tier.slice(1).toLowerCase();
  const color = {
    MEMBER: 'bg-neutral-200 text-neutral-800',
    BRONZE: 'bg-accent-bronze/20 text-accent-bronze',
    SILVER: 'bg-accent-silver/20 text-accent-silver',
    GOLD: 'bg-accent-gold/20 text-accent-gold',
  }[tier];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}