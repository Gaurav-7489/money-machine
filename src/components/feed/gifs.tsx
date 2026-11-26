"use client";

import { Loader2, Search, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFeedback } from "@/components/feedback";
import { Sheet } from "@/components/ui";
import { MAX_GIF_BYTES, saveMedia, useMediaUrl } from "@/lib/media";

/**
 * GIFs, searchable like in a chat app.
 *
 * - With a GIPHY API key (NEXT_PUBLIC_GIPHY_API_KEY), people search GIPHY's
 *   whole library, and real GIFs are saved on posts as "giphy:<id>".
 * - Without a key, they search the built-in library below: well over a
 *   hundred animated reaction cards that work offline.
 * - People can always upload their own .gif (kept on the device in the preview).
 */
const GIPHY_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? "";

type Anim = "gif-bounce" | "gif-pulse" | "gif-rise" | "gif-wiggle" | "gif-spin";
export interface BuiltInGif {
  id: string;
  text: string;
  emoji: string;
  anim: Anim;
  bg: string;
  tags: string;
}

/** The first twelve keep their ids: older posts and comments point at them. */
const CLASSIC: BuiltInGif[] = [
  { id: "lets-go", text: "LET'S GO", emoji: "🚀", anim: "gif-bounce", bg: "from-violet-600 via-fuchsia-600 to-amber-500", tags: "hype excited start launch" },
  { id: "deal", text: "DEAL!", emoji: "🤝", anim: "gif-pulse", bg: "from-emerald-500 via-teal-500 to-sky-500", tags: "agree collab handshake yes" },
  { id: "paid", text: "GOT PAID", emoji: "💸", anim: "gif-rise", bg: "from-emerald-600 via-lime-500 to-amber-400", tags: "money cash payday rich" },
  { id: "fire", text: "FIRE", emoji: "🔥", anim: "gif-wiggle", bg: "from-orange-500 via-rose-500 to-fuchsia-600", tags: "hot lit amazing" },
  { id: "slay", text: "SLAY", emoji: "💅", anim: "gif-wiggle", bg: "from-pink-500 via-fuchsia-500 to-violet-600", tags: "queen makeup beauty sassy" },
  { id: "yay", text: "YAY!", emoji: "🎉", anim: "gif-bounce", bg: "from-amber-400 via-orange-500 to-rose-500", tags: "party celebrate happy" },
  { id: "omg", text: "OMG", emoji: "😱", anim: "gif-pulse", bg: "from-sky-500 via-indigo-500 to-violet-600", tags: "shock wow surprised" },
  { id: "lol", text: "LOL", emoji: "😂", anim: "gif-bounce", bg: "from-yellow-400 via-amber-500 to-orange-500", tags: "laugh funny haha" },
  { id: "love", text: "LOVE IT", emoji: "😍", anim: "gif-pulse", bg: "from-rose-500 via-pink-500 to-fuchsia-500", tags: "heart cute adore" },
  { id: "clap", text: "BRAVO", emoji: "👏", anim: "gif-wiggle", bg: "from-teal-500 via-emerald-500 to-lime-500", tags: "applause well done congrats" },
  { id: "mindblown", text: "MIND BLOWN", emoji: "🤯", anim: "gif-pulse", bg: "from-fuchsia-600 via-purple-600 to-indigo-700", tags: "wow shock crazy" },
  { id: "money", text: "MONEY MOVES", emoji: "🤑", anim: "gif-spin", bg: "from-amber-400 via-yellow-500 to-emerald-500", tags: "cash rich business" },
];

/** "TEXT|emoji|search words" — turned into cards with rotating colours and motion. */
const LIBRARY = `HELLO|👋|hi hey wave greeting
HI THERE|🙋|hello hey wave
GOOD MORNING|☀️|morning sun hello day
GOOD NIGHT|🌙|night sleep bye moon
BYE|👋|goodbye see you later wave
THANK YOU|🙏|thanks grateful please
THANKS!|💐|thank you flowers grateful
YOU'RE WELCOME|😊|welcome smile thanks
SORRY|🥺|apology sad oops
OOPS|🙈|mistake sorry embarrassed
YES!|✅|agree ok correct right
NO|🙅|nope refuse never
MAYBE|🤔|think unsure hmm
HMM|🧐|think curious wonder
OK|👌|okay fine sure agree
SURE|👍|yes ok thumbs up
NOPE|❌|no never refuse
WOW|😮|amazing surprised shock
AMAZING|🤩|wow great star struck
SO GOOD|😋|yummy tasty delicious food
YUMMY|🍕|food pizza tasty eat
DELICIOUS|🍜|food noodles tasty eat
COFFEE TIME|☕|coffee morning tired drink
TEA TIME|🍵|tea drink chill relax
SNACK TIME|🍿|popcorn snack movie watch
CAKE!|🎂|birthday party celebrate sweet
HAPPY BIRTHDAY|🥳|birthday party celebrate
CONGRATS|🏆|win congratulations trophy award
WINNER|🥇|win gold first champion
CHAMPION|🏅|win medal best
LEVEL UP|⬆️|grow progress upgrade game
GAME ON|🎮|gaming play video game
GG|🕹️|gaming good game win
BOOM|💥|explode wow impact
POW|💫|wow hit comic
ZAP|⚡|energy power electric fast
SPARKLE|✨|sparkle magic shine glow
GLOW UP|🌟|glow skincare beauty shine
SELF CARE|🧖|skincare spa relax wellness
SKIN DAY|🧴|skincare routine serum
GRWM|💄|makeup get ready beauty
NEW LOOK|💇|hair haircare style makeover
OUTFIT CHECK|👗|fashion ootd style clothes
OOTD|👠|fashion outfit style
DRIP|💧|fashion style cool
SHOPPING|🛍️|shop buy haul fashion
HAUL|📦|unboxing shop package
UNBOXING|🎁|unbox review package gift
GIFT|🎀|present gift pr package free
PR PACKAGE|📮|free gift parcel brand
NEW DROP|🆕|launch new product release
LAUNCH DAY|🛸|launch new product release
SALE!|🏷️|discount offer deal shop
LINK IN BIO|🔗|affiliate link bio shop
USE MY CODE|🎟️|affiliate code discount
COLLAB?|🤜🤛|collab partner work together
LET'S WORK|💼|business work collab deal
OPEN FOR DEALS|📬|deal collab brand open
SIGNED!|✍️|contract deal agree sign
NEW CLIENT|🤝|business deal client
CHA-CHING|💰|money cash sale earn
PROFIT|📈|money growth business up
TO THE MOON|🌕|growth stocks rocket up
STONKS|📊|growth chart business
GROWTH|🌱|grow plant progress
HUSTLE|🏃|work grind busy
GRIND|⚙️|work hustle busy
BUSY|📅|calendar work schedule
DEADLINE|⏰|time late hurry
ON MY WAY|🚗|coming travel car
TRAVEL MODE|✈️|travel trip plane holiday
VACAY|🏖️|beach holiday travel summer
ADVENTURE|🏔️|travel mountain hike
ROAD TRIP|🛣️|travel car drive
WANDERLUST|🗺️|travel map explore
FITNESS|💪|gym workout strong
GYM TIME|🏋️|gym workout fitness
NO EXCUSES|🔥|motivation fitness workout
RUN!|🏃‍♀️|run fitness cardio
YOGA|🧘|yoga relax wellness calm
CALM|🌿|relax chill peace
CHILL|😎|cool relax chill
COOL|🆒|cool nice awesome
VIBES|🌈|vibe good mood
GOOD VIBES|☮️|vibe peace happy
MOOD|🎭|feeling mood vibe
SAME|🤝|agree relate me too
ME TOO|🙋‍♀️|same agree relate
RELATABLE|💯|same true real
100%|💯|agree true perfect
TRUE|✔️|right agree fact
FACTS|📢|true agree real
PERIODT|💁|sassy end of story true
ICONIC|👑|queen legend king best
QUEEN|👸|queen slay iconic
KING|🤴|king boss best
BOSS|😤|boss leader business
LEGEND|🦸|hero legend best
HERO|🦸‍♂️|hero save best
PROUD|🥹|proud happy tears
SO PROUD|🫶|proud love heart
CUTE|🥰|cute adorable love
AWW|🐶|cute puppy pet aww
PUPPY|🐕|dog pet cute
KITTY|🐱|cat pet cute
PET LOVE|🐾|pet dog cat
BABY|👶|baby parenting cute
FAMILY|👨‍👩‍👧|family parenting home
HOME SWEET HOME|🏡|home decor house
COZY|🛋️|home decor cosy comfy
DIY|🔨|craft make build
CRAFTY|🎨|art paint craft creative
CREATIVE|🖌️|art design creative
CONTENT DAY|🎬|filming video creator
FILMING|🎥|video camera creator
ACTION!|📽️|film video movie
LIVE NOW|🔴|live stream streaming
GOING LIVE|📡|live stream broadcast
NEW VIDEO|▶️|youtube video upload
NEW POST|📸|instagram photo post
SELFIE|🤳|photo selfie camera
VIRAL|📈|trending viral popular
TRENDING|🔝|trending popular top
LIKE IT|❤️|like heart love
SHARE!|🔁|share repost
SAVE THIS|🔖|save bookmark later
READ THIS|📖|read book learn
STUDY TIME|📚|study learn school education
BIG BRAIN|🧠|smart clever genius idea
IDEA!|💡|idea think bright
GENIUS|🤓|smart clever nerd
TECH TALK|💻|tech computer laptop
GADGETS|📱|tech phone gadget review
REVIEW TIME|⭐|review rating stars
5 STARS|🌟|review rating best
MUSIC|🎵|music song listen
DANCE|💃|dance party music
PARTY|🪩|party dance club
CHEERS|🥂|toast celebrate drink
FRIDAY!|🍹|weekend friday fun
WEEKEND|🛌|weekend rest relax
MONDAY|😩|monday tired work
TIRED|😴|sleep tired sleepy
SLEEPY|💤|sleep tired night
HUNGRY|🍔|food hungry eat
NERVOUS|😬|nervous awkward scared
SCARED|😨|scared afraid fear
ANGRY|😡|angry mad upset
UGH|😤|annoyed frustrated
SAD|😢|sad cry upset
CRYING|😭|cry sad tears
HUGS|🤗|hug love care
SENDING LOVE|💌|love heart care
MISS YOU|🥲|miss love sad
HIGH FIVE|🖐️|celebrate yay team
TEAMWORK|🫂|team together collab
WE DID IT|🙌|celebrate win team
FINALLY|😮‍💨|relief finally done
DONE!|🏁|finish complete done
NEXT!|⏭️|next move on
PLOT TWIST|🌀|surprise twist wow
SPILL THE TEA|🫖|gossip tea news
DRAMA|🎭|drama gossip
POPCORN|🍿|watching drama movie
WAIT WHAT|❓|confused what huh
CONFUSED|😵‍💫|confused lost huh
SHHH|🤫|quiet secret
SECRET|🔐|secret private
COMING SOON|⏳|soon tease launch
STAY TUNED|📺|soon wait tune
WELCOME|🎊|welcome hello new
JOIN US|📣|join invite community
GOOD LUCK|🍀|luck wish best
YOU GOT THIS|💪|motivation support encourage
KEEP GOING|🏃‍♂️|motivation progress
BELIEVE|🌠|hope dream motivation
DREAM BIG|☁️|dream motivation goals
GOALS|🎯|goal target aim
NAILED IT|🎯|success perfect win
PERFECT|👌|perfect great nice
NICE|😁|nice good great
EPIC|🐉|epic awesome legendary
SPICY|🌶️|spicy hot food
SWEET|🍭|sweet candy cute
FRESH|🍋|fresh new clean
SUMMER|🌻|summer sun hot
WINTER|❄️|winter cold snow
RAINY DAY|🌧️|rain weather cosy
FESTIVE|🪔|diwali festival lights celebrate
EID MUBARAK|🌙|eid festival celebrate
MERRY XMAS|🎄|christmas festive holiday
NEW YEAR|🎆|new year fireworks celebrate`;

const BGS = [
  "from-violet-600 via-fuchsia-600 to-amber-500",
  "from-emerald-500 via-teal-500 to-sky-500",
  "from-orange-500 via-rose-500 to-fuchsia-600",
  "from-sky-500 via-indigo-500 to-violet-600",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-rose-500 via-pink-500 to-fuchsia-500",
  "from-teal-500 via-emerald-500 to-lime-500",
  "from-fuchsia-600 via-purple-600 to-indigo-700",
  "from-yellow-400 via-amber-500 to-orange-500",
  "from-cyan-500 via-sky-500 to-blue-600",
  "from-lime-500 via-green-500 to-emerald-600",
  "from-pink-500 via-rose-500 to-red-500",
];
const ANIMS: Anim[] = ["gif-bounce", "gif-pulse", "gif-wiggle", "gif-rise", "gif-pulse", "gif-bounce"];
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "gif";

export const GIFS: BuiltInGif[] = [
  ...CLASSIC,
  ...LIBRARY.split("\n").map((line, i) => {
    const [text, emoji, tags] = line.split("|") as [string, string, string];
    return { id: `b-${slug(text)}-${i}`, text, emoji, tags, bg: BGS[i % BGS.length]!, anim: ANIMS[i % ANIMS.length]! };
  }),
];

function searchBuiltIn(q: string): BuiltInGif[] {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return GIFS;
  return GIFS.filter((g) => {
    const hay = `${g.text} ${g.tags}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

const giphyId = (id: string) => (/^[A-Za-z0-9]{4,40}$/.test(id) ? id : null);

export function GifView({ id, size = "md" }: { id: string; size?: "sm" | "md" | "lg" }) {
  if (id.startsWith("media:")) return <UploadedGif id={id.slice(6)} size={size} />;
  if (id.startsWith("giphy:")) {
    const gid = giphyId(id.slice(6));
    if (!gid) return null;
    const cls = size === "sm" ? "max-h-24" : size === "lg" ? "max-h-[420px] w-full" : "max-h-48";
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`https://media.giphy.com/media/${gid}/${size === "lg" ? "giphy" : "200"}.gif`} alt="GIF" loading="lazy" className={`rounded-xl object-contain ${cls}`} />;
  }
  const g = GIFS.find((x) => x.id === id);
  if (!g) return null;
  const box = size === "sm" ? "h-24 w-36 text-[11px]" : size === "lg" ? "aspect-[16/10] w-full text-2xl" : "h-36 w-56 text-sm";
  const emoji = size === "sm" ? "text-3xl" : size === "lg" ? "text-7xl" : "text-5xl";
  return (
    <div role="img" aria-label={`GIF: ${g.text}`} className={`gif-hue relative grid place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${g.bg} ${box}`} style={{ animationDuration: "9s" }}>
      <span className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/25 blur-xl" />
      <span className="absolute -bottom-8 -right-4 h-28 w-28 rounded-full bg-black/10 blur-xl" />
      <span className={`relative ${g.anim} ${emoji}`}>{g.emoji}</span>
      <span className="absolute bottom-2 left-0 right-0 px-1 text-center font-black tracking-wider text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">{g.text}</span>
      <span className="absolute left-2 top-2 rounded bg-black/40 px-1.5 text-[9px] font-bold text-white">GIF</span>
    </div>
  );
}

function UploadedGif({ id, size }: { id: string; size: "sm" | "md" | "lg" }) {
  const { url, missing } = useMediaUrl(id);
  const cls = size === "sm" ? "max-h-24" : size === "lg" ? "max-h-[420px] w-full" : "max-h-48";
  if (missing) return <p className="rounded-xl bg-elevated px-3 py-2 text-xs text-muted">GIF saved on another device</p>;
  if (!url) return <div className={`skeleton h-24 w-36`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="GIF" className={`rounded-xl object-contain ${cls}`} />;
}

type GiphyHit = { id: string; title: string; preview: string };

/** Searches GIPHY as you type (trending when the box is empty). */
function useGiphy(q: string, enabled: boolean) {
  const [state, setState] = useState<{ hits: GiphyHit[]; loading: boolean; failed: boolean }>({ hits: [], loading: false, failed: false });
  useEffect(() => {
    if (!enabled || !GIPHY_KEY) return;
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, failed: false }));
    const t = setTimeout(async () => {
      try {
        const term = q.trim();
        const url = term
          ? `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(GIPHY_KEY)}&q=${encodeURIComponent(term)}&limit=48&rating=pg`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${encodeURIComponent(GIPHY_KEY)}&limit=48&rating=pg`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { data: { id: string; title: string; images: { fixed_width_small?: { url: string }; fixed_width: { url: string } } }[] };
        const hits = json.data.filter((d) => giphyId(d.id)).map((d) => ({ id: d.id, title: d.title || "GIF", preview: (d.images.fixed_width_small ?? d.images.fixed_width).url }));
        setState({ hits, loading: false, failed: false });
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState({ hits: [], loading: false, failed: true });
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, enabled]);
  return state;
}

export function GifPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (id: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const { toast } = useFeedback();
  const giphy = useGiphy(q, open);
  const useGiphyResults = !!GIPHY_KEY && !giphy.failed;
  const builtIn = useMemo(() => searchBuiltIn(q), [q]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  function pick(id: string) {
    onPick(id);
    onClose();
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "image/gif") return toast("Please pick a .gif file.", "error");
    if (file.size > MAX_GIF_BYTES) return toast("That GIF is over 8 MB. Please pick a smaller one.", "error");
    setBusy(true);
    try {
      pick(`media:${await saveMedia(file)}`);
    } catch {
      toast("We couldn't save that GIF on this device.", "error");
    } finally {
      setBusy(false);
    }
  }

  const count = useGiphyResults ? giphy.hits.length : builtIn.length;

  return (
    <Sheet open={open} onClose={onClose} title="Add a GIF">
      <div className="sticky -top-4 z-10 -mx-5 -mt-4 bg-surface px-5 pb-3 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <label htmlFor="gif-q" className="sr-only">Search GIFs</label>
          <input
            id="gif-q"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Search GIFs, e.g. happy, money, dance"
            className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-11 text-[15px] outline-none focus:border-brand-400"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-elevated" aria-label="Clear GIF search">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-[12px] text-muted" aria-live="polite">
          {useGiphyResults && giphy.loading ? "Searching…" : `${count} ${count === 1 ? "GIF" : "GIFs"}${q.trim() ? ` for “${q.trim()}”` : ""}`}
        </p>
      </div>

      {useGiphyResults ? (
        giphy.hits.length > 0 ? (
          <ul className="columns-2 gap-2 sm:columns-3">
            {giphy.hits.map((h) => (
              <li key={h.id} className="mb-2 break-inside-avoid">
                <button type="button" onClick={() => pick(`giphy:${h.id}`)} className="press block w-full overflow-hidden rounded-xl bg-elevated ring-1 ring-line hover:ring-2 hover:ring-brand-400" aria-label={`Use GIF: ${h.title}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={h.preview} alt="" loading="lazy" className="block w-full" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !giphy.loading && <p className="py-8 text-center text-sm text-muted">No GIFs found. Try another word.</p>
        )
      ) : builtIn.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {builtIn.map((g) => (
            <li key={g.id}>
              <button type="button" onClick={() => pick(g.id)} className="press block w-full overflow-hidden rounded-xl ring-1 ring-line hover:ring-2 hover:ring-brand-400" aria-label={`Use GIF ${g.text}`}>
                <div className="pointer-events-none [&>div]:!h-24 [&>div]:!w-full">
                  <GifView id={g.id} size="sm" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-sm text-muted">No GIFs found for “{q.trim()}”. Try “happy”, “money” or “love”.</p>
      )}

      {useGiphyResults && <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted">Powered by GIPHY</p>}
      <input ref={fileRef} type="file" accept="image/gif" className="sr-only" onChange={upload} tabIndex={-1} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="press mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 text-sm font-semibold text-brand-700 hover:bg-brand-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload your own GIF
      </button>
    </Sheet>
  );
}
