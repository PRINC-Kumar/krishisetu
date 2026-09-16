import { Sprout } from "lucide-react";
export default function EmptyState({ title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-grove/30 bg-white/70 p-10 text-center">
      <Sprout className="mx-auto text-grove" size={42} />
      <h3 className="mt-3 font-heading text-xl text-leaf">{title}</h3>
      <p className="mt-2 text-sm text-soil">{text}</p>
    </div>
  );
}
