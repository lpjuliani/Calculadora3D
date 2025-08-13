export type MarginBadge = {
  label: string;
  icon: string;
  colorClasses: string;
  message: string;
};

// clamp opcional só para não exagerar no gráfico
const clamp = (v: number, min = -1_000, max = 50_000) => {
  const result = Math.max(min, Math.min(max, v));
  return result;
};

export function getMarginBadge(p: number): MarginBadge {
  // normaliza: número, "120%", "120,5", razão (0.7 => 70)
  const raw: any = p as any;
  let n: number;

  if (typeof raw === 'number') {
    n = raw;
  } else {
    const s = String(raw).trim().replace('%', '').replace(/\s+/g, '').replace(',', '.');
    n = parseFloat(s);
  }

  // se veio como razão (|n| <= 1), interpreta como 0–100%
  if (Number.isFinite(n) && Math.abs(n) <= 1) {
    n = n * 100;
  }

  // clamp e arredonda para evitar 99.999999
  const EPS = 1e-6;
  const pctRaw = clamp(Number.isFinite(n) ? n : 0);
  const pct = Math.round(pctRaw * 1000) / 1000; // 3 casas já basta

  // ≥ 1500% - Overkill
  if (pct + EPS >= 1500) {
    return { label: 'Overkill (1500%+)', icon: 'Infinity', colorClasses: 'bg-emerald-100 text-emerald-800', message: 'Modo infinito. Você hackeou a margem ∞' };
  }
  // 1000% a 1499.999% - Mítica
  if (pct + EPS >= 1000) {
    return { label: 'Mítica (1000%+)', icon: 'Trophy', colorClasses: 'bg-emerald-100 text-emerald-800', message: 'Placar estourado. 🏆' };
  }
  // 700% a 999.999% - Ridícula
  if (pct + EPS >= 700) {
    return { label: 'Ridícula (700%+)', icon: 'Trophy', colorClasses: 'bg-emerald-100 text-emerald-800', message: 'Margem que dá até vontade de dançar 🎉' };
  }
  // 400% a 699.999% - Ultra
  if (pct + EPS >= 400) {
    return { label: 'Ultra (400%+)', icon: 'Zap', colorClasses: 'bg-emerald-100 text-emerald-800', message: 'Isso virou máquina de margens.' };
  }
  // 200% a 399.999% - Turbo
  if (pct + EPS >= 200) {
    return { label: 'Turbo (200%+)', icon: 'Zap', colorClasses: 'bg-emerald-100 text-emerald-800', message: 'Impressora em modo turbo ⚡' };
  }
  // 100% a 199.999% - Margem Excelente
  if (pct + EPS >= 100) {
    return { label: 'Margem Excelente', icon: 'Medal', colorClasses: 'bg-emerald-100 text-emerald-800', message: 'Lucro turbinado. Parabéns! 🥇' };
  }

  // 60% a 99.999% - Margem Muito Boa
  if (pct + EPS >= 60 && pct < 100 - EPS) {
    return { label: 'Margem Boa', icon: 'Crown', colorClasses: 'bg-green-100 text-green-800', message: 'Lucro turbinado. Parabéns! 🥇' };
  }

  // 40% a 59.999% - Dá Para Melhorar
  if (pct + EPS >= 40) {
    return { label: 'Dá Para Melhorar', icon: 'Rocket', colorClasses: 'bg-green-100 text-green-800', message: 'Escalando bonito! 🚀' };
  }
  // 25% a 39.999% - Café Pago
  if (pct + EPS >= 25) {
    return { label: 'Café Pago', icon: 'Coffee', colorClasses: 'bg-green-100 text-green-800', message: 'Essa peça bancou o café da firma ☕' };
  }
  // 15% a 24.999% - Margem Razoável
  if (pct + EPS >= 15) {
    return { label: 'Margem Razoável', icon: 'ThumbsUp', colorClasses: 'bg-green-100 text-green-800', message: 'Agora vai! 🍀' };
  }
  // 5% a 14.999% - Margem Baixa
  if (pct + EPS >= 5) {
    return { label: 'Margem Baixa', icon: 'AlertTriangle', colorClasses: 'bg-yellow-100 text-yellow-800', message: 'Atenção: tem gordura pra cortar.' };
  }
  // 0.001% a 4.999% - Margem Crítica
  if (pct > 0) {
    return { label: 'Margem Crítica', icon: 'AlertTriangle', colorClasses: 'bg-orange-100 text-orange-800', message: 'Quase nada. Otimize tempo e insumos.' };
  }

  // 0% - Sem Lucro
  if (Math.abs(pct) <= EPS) {
    return { label: 'Sem Lucro', icon: 'MinusCircle', colorClasses: 'bg-gray-100 text-gray-700', message: 'Ponto de equilíbrio. Falta um empurrãozinho.' };
  }

  // -10% a -0.001% - Prejuízo Leve
  if (pct > -10) {
    return { label: 'Prejuízo Leve', icon: 'AlertTriangle', colorClasses: 'bg-red-50 text-red-700', message: 'Dá pra virar. Pequenos ajustes resolvem.' };
  }
  // -30% a -10% - Prejuízo Forte
  if (pct > -30) {
    return { label: 'Prejuízo Forte', icon: 'TrendingDown', colorClasses: 'bg-red-100 text-red-800', message: 'Cada peça sai no vermelho. Recalcula preço já.' };
  }
  // ≤ -30% - Prejuízo Catastrófico
  return { label: 'Prejuízo Catastrófico', icon: 'Skull', colorClasses: 'bg-red-200 text-red-900', message: 'Puxa o freio. Revisão total de custos! ☠️' };
}