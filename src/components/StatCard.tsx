export function StatCard({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.06)] p-5 hover:shadow-[0_4px_16px_rgba(15,23,42,0.1)] transition-shadow">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tamak-navy to-tamak-gold" />
      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-tamak-navy mt-1.5">
        {value} {suffix && <span className="text-base font-normal text-gray-400">{suffix}</span>}
      </p>
    </div>
  );
}