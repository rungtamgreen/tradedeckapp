export const PLANS = {
  free: {
    name: 'Free',
    customers: 5,
    quotesPerMonth: 5,
  },
  pro: {
    name: 'Pro',
    price_id: 'price_1TA7rBBjid6EToKsbO4rph8P',
    product_id: 'prod_U8OeOqczZNSp8X',
    customers: Infinity,
    quotesPerMonth: Infinity,
  },
} as const;

export type PlanName = keyof typeof PLANS;

export function getPlanByProductId(productId: string | null): PlanName {
  if (productId === PLANS.pro.product_id) return 'pro';
  return 'free';
}
