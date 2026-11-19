# Money Machine UI direction

The landing page uses a warm editorial canvas and a miniature workspace to show how matches, offers and earnings fit together. The workspace uses solid surfaces, visible borders and restrained emphasis.

| Token | Light | Dark |
| --- | --- | --- |
| Canvas | `#F6F5F0` | `#171915` |
| Surface | `#FFFEFA` | `#20221D` |
| Elevated | `#EEEDE6` | `#292D26` |
| Ink | `#242821` | `#EFEEE6` |
| Muted | `#62665B` | `#AEB2A5` |
| Line | `#DCDED4` | `#3B4238` |
| Primary action | `#286144` | `#9CCBA7` |
| Accent | `#765A21` | `#E0C087` |

Green identifies actions, active states, matching and positive money signals. The bronze accent identifies pending items and achievements. Error and destructive states use the danger token. Use the roles in `src/app/globals.css` for new UI.

- **Type.** Bricolage Grotesque at 700 for display headings. Inter at 400 for body copy and 600–700 for labels and controls. Use tabular numerals for amounts and scores.
- **Spacing.** Follow a 4 px base grid. Use 16–28 px inside cards, 16 px mobile gutters and 32 px desktop gutters. Section spacing scales from 48 to 96 px.
- **Shape and depth.** Use 10 px control, 14 px card and 18 px panel corners. Reserve fully rounded shapes for avatars, chips and meters. Use subtle shadows on cards and deeper neutral shadows on overlays and the hero stack.
- **Motion.** Use 150–300 ms input and navigation transitions. Use one observer for one-time 340 ms section entrances. Three.js computes the landing card rotation on fine-pointer devices and loads on first mouse interaction. HTML and CSS draw the cards. Reduced-motion and touch visitors see the same preview without pointer animation or an animation loop.
