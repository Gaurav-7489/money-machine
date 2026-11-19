/**
 * Editorial photography library.
 *
 * Every photograph is a public Unsplash CDN asset, chosen for real creator and
 * business contexts and free of visible third-party logos. They illustrate
 * niches and the product's story; they never depict a specific Money Machine
 * user. Images render through next/image (see next.config.ts remotePatterns),
 * so they are resized, served as AVIF/WebP and lazy-loaded.
 */

export interface Photo {
  id: string;
  alt: string;
}

const P = (id: string, alt: string): Photo => ({ id, alt });

/** Raw CDN URL. Prefer <Image src={photoSrc(p)} /> so Next optimises the size. */
export function photoSrc(p: Photo, w = 1600) {
  return `https://images.unsplash.com/photo-${p.id}?w=${w}&q=80&auto=format&fit=crop`;
}

/** Landing-page story imagery. */
export const STORY = {
  creatorPortrait: P("1524504388940-b1c1722653e1", "A creator photographed against a dark studio backdrop"),
  creatorHood: P("1554048612-b6a482bc67e5", "A creator in a denim jacket and hoodie, smiling off camera"),
  creatorHat: P("1539571696357-5a69c17a67c6", "A young creator in a black hat"),
  creatorRed: P("1494790108377-be9c29b29330", "A creator laughing in a red sweater"),
  creatorStudio: P("1534528741775-53994a69daeb", "A creator lit in blue studio light"),
  filming: P("1492691527719-9d1e07e534b4", "A creator filming a mountain landscape at sunrise"),
  camera: P("1542038784456-1ea8e935640e", "A photographer holding a camera toward the lens"),
  shop: P("1556742049-0cfed4f6a45d", "A small business owner taking a card payment at the counter"),
  team: P("1522202176988-66273c2fd55f", "A brand team planning a campaign around laptops"),
  deal: P("1600880292203-757bb62b4baf", "Two partners celebrating a closed deal at the office"),
  studio: P("1556761175-b413da4baf72", "An open studio office with people at work"),
  meeting: P("1573497019940-1c28c88b4f3e", "A business founder in a glass-walled office"),
  desk: P("1551836022-d5d88e9218df", "A founder taking notes beside a laptop"),
  phone: P("1585399000684-d2f72660f092", "A phone on a marigold-orange desk"),
  rack: P("1490481651871-ab68de25d43d", "A clothing rack of neutral garments in a small studio"),
  kitchen: P("1556909114-f6e7ad7d3136", "Two people cooking together for a food video"),
} as const;

/** One photograph per niche, used for covers, opportunity headers and showcases. */
export const NICHE_PHOTOS: Record<string, Photo> = {
  Makeup: P("1596462502278-27bfdc403348", "Brushes, lipstick and powder laid out on a sand-coloured surface"),
  Skincare: P("1608571423902-eed4a5ad8108", "An unlabelled amber dropper bottle in soft window light"),
  Haircare: P("1522337360788-8b13dee7a37e", "Long wavy hair against a pink wall"),
  Fashion: P("1515886657613-9f3515b0c78f", "A model in a yellow tracksuit on a beach court"),
  Fitness: P("1599058917765-a780eda07a3e", "An athlete training with battle ropes in an open concrete gym"),
  "Home Decor": P("1600210492486-724fe5c67fb0", "A bright living room with plants and framed prints"),
  Food: P("1547592180-85f173990554", "A colourful grain bowl seen from above"),
  Travel: P("1464822759023-fed622ff2c3b", "A valley of pine forest under snowy peaks"),
  Tech: P("1505740420928-5e560c06d30e", "Black headphones on a bright yellow background"),
  Gaming: P("1598550476439-6847785fcea6", "A streamer's multi-monitor gaming setup"),
  Parenting: P("1511895426328-dc8714191300", "A family holding hands on the beach at sunset"),
  Finance: P("1554224155-6726b3ff858f", "Tax forms, a calculator and a pen on a desk"),
  Education: P("1503676260728-1c00da094a0b", "An apple on a stack of books with coloured pencils"),
  Lifestyle: P("1517248135467-4c7edcad34c4", "A warmly lit restaurant interior"),
  Pets: P("1543466835-00a7907e9de1", "A smiling beagle looking at the camera"),
  Wellness: P("1544367567-0f2fcb009e0b", "A yoga pose silhouetted against a sunset sea"),
};

const FALLBACK = STORY.camera;

export function nichePhoto(niche: string | undefined): Photo {
  return (niche && NICHE_PHOTOS[niche]) || FALLBACK;
}
