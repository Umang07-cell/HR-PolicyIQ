export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const formatMonth = (month: string) => {
  const [y, m] = month.split("-");
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
export const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "..." : s);
