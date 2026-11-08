import { Bookmark, Heart, Home, MessageCircle, PlusSquare, Search, Send, Sparkles, User } from "lucide-react";
import { LogoMark } from "@/components/logo";

/** Decorative product illustration for the landing hero (fictional content). */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]" aria-hidden="true">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-tr from-aqua/30 via-brand-100 to-lime/40 blur-3xl" />
      <div className="animate-float rounded-[2.75rem] border border-line bg-white p-2.5 shadow-[0_40px_80px_-30px_rgba(14,122,92,0.35)]">
        <div className="overflow-hidden rounded-[2.25rem] bg-canvas">
          <div className="flex items-center justify-between bg-white px-4 pb-2 pt-4">
            <LogoMark className="h-6 w-6" />
            <span className="h-1.5 w-16 rounded-full bg-line" />
            <span className="h-5 w-5 rounded-full bg-canvas" />
          </div>
          <div className="flex gap-2.5 bg-white px-4 pb-3">
            {["from-rose-200 to-orange-100", "from-sky-200 to-teal-50", "from-lime-200 to-emerald-100", "from-violet-200 to-pink-100"].map((g, i) => (
              <span key={i} className="rounded-full bg-gradient-to-tr from-brand-500 via-aqua to-lime p-[2px]">
                <span className={`block h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br ${g}`} />
              </span>
            ))}
          </div>
          <div className="m-3 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-rose-200 to-orange-100" />
              <span className="space-y-1">
                <span className="block h-2 w-20 rounded-full bg-ink/80" />
                <span className="block h-1.5 w-10 rounded-full bg-line" />
              </span>
            </div>
            <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-rose-200 via-pink-100 to-orange-100">
              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-white/70 shadow">
                <Sparkles className="h-8 w-8 text-rose-500" strokeWidth={1.6} />
              </span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 text-ink">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              <MessageCircle className="h-4 w-4" />
              <Send className="h-4 w-4" />
              <Bookmark className="ml-auto h-4 w-4" />
            </div>
          </div>
          <div className="flex justify-around border-t border-line bg-white py-3 text-ink">
            <Home className="h-5 w-5 text-brand-700" />
            <Search className="h-5 w-5" />
            <PlusSquare className="h-5 w-5" />
            <MessageCircle className="h-5 w-5" />
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="absolute -left-14 top-24 animate-[float_7s_ease-in-out_infinite_0.6s] rounded-2xl border border-line bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:-left-20">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Affiliate program</p>
        <p className="text-sm font-semibold">15% commission</p>
      </div>
      <div className="absolute -right-10 bottom-28 animate-[float_8s_ease-in-out_infinite_1.2s] rounded-2xl border border-line bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:-right-16">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Badge earned</p>
        <p className="text-sm font-semibold">⭐ Collab Pro</p>
      </div>
    </div>
  );
}
