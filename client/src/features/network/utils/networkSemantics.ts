export type NetworkTone = 'critical' | 'warning' | 'normal' | 'neutral';

export function riskTone(score?: number | null): NetworkTone {
  if (score == null) return 'neutral';
  if (score >= 70) return 'critical';
  if (score >= 40) return 'warning';
  return 'normal';
}

export function statusTone(status?: string | null): NetworkTone {
  switch (status?.toUpperCase()) {
    case 'CRITICAL': return 'critical';
    case 'DISRUPTED':
    case 'MAINTENANCE':
    case 'DEGRADED': return 'warning';
    case 'ACTIVE':
    case 'OPERATIONAL': return 'normal';
    default: return 'neutral';
  }
}

export function overallTone(status?: string | null, score?: number | null): NetworkTone {
  const tones = [statusTone(status), riskTone(score)];
  if (tones.includes('critical')) return 'critical';
  if (tones.includes('warning')) return 'warning';
  if (tones.includes('normal')) return 'normal';
  return 'neutral';
}

export const toneTextClass: Record<NetworkTone, string> = {
  critical: 'text-aegis-red',
  warning: 'text-aegis-yellow',
  normal: 'text-aegis-green',
  neutral: 'text-aegis-text-muted',
};

export const toneDotClass: Record<NetworkTone, string> = {
  critical: 'bg-aegis-red shadow-[0_0_5px_rgba(255,65,77,0.5)]',
  warning: 'bg-aegis-yellow shadow-[0_0_5px_rgba(245,158,11,0.45)]',
  normal: 'bg-aegis-green shadow-[0_0_5px_rgba(22,217,120,0.5)]',
  neutral: 'bg-aegis-text-muted',
};

export const toneBadgeClass: Record<NetworkTone, string> = {
  critical: 'border border-aegis-red/30 bg-aegis-red/20 text-aegis-red',
  warning: 'border border-aegis-yellow/30 bg-aegis-yellow/15 text-aegis-yellow',
  normal: 'border border-aegis-green/30 bg-aegis-green/20 text-aegis-green',
  neutral: 'border border-aegis-border bg-aegis-elevated text-aegis-text-muted',
};

export function riskLabel(score?: number | null) {
  const tone = riskTone(score);
  return tone === 'critical' ? 'CRITICAL' : tone === 'warning' ? 'ELEVATED' : tone === 'normal' ? 'NORMAL' : 'UNRATED';
}
