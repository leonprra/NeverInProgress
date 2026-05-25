export type ProjectCard = {
  label: string
  heading: string
  paragraphs: string[]
  kvs: { k: string; v: string; on?: string }[]
  figRef: string
  figCaption?: string
  images?: string[]
}

export type Project = {
  n: string
  title: string
  year: string
  slug: string
  filter: string
  thumb: string
  thumbnail?: string
  url?: string
  tagline?: string
  problem?: string
  heroCaption?: string
  heroCaptionRight?: string
  specs?: { k: string; v: string }[]
  cards?: ProjectCard[]
  credits?: { k: string; lines: string[] }[]
}

const PROJECTS: Project[] = [
  { n: "011", title: "BUBL",                            year: "2025", slug: "bubl",                                   filter: "Industrial",    thumb: "https://framerusercontent.com/images/fL9sBxAGrZ1a5wuWoV57vA8Arw.jpg" },
  { n: "010", title: "H.A.V.O.K",                       year: "2024", slug: "h-a-v-o-k",                              filter: "Industrial",    thumb: "https://framerusercontent.com/images/2gXGTeKm9OymU8ZdYpbwEaKYGlw.png", url: "/projects/havok.html",         problem: "The thrill is not in the shot. It is in the reaction.", tagline: "Removing features kept making the game feel better." },
  { n: "007", title: "My First Pill",                   year: "2023", slug: "my-first-pill",                          filter: "Industrial",    thumb: "https://framerusercontent.com/images/lZS20YiOrIGbjmhVZ1u3mX8xXIs.png", url: "/projects/my-first-pill.html", problem: "Most swallowing aids address the physical act. They do not address the fear underneath it.", tagline: "Readiness is built in layers. Emotional comfort comes before physical practice." },
  { n: "013", title: "Resonaid",                        year: "2025", slug: "resonaid",                               filter: "Industrial",    thumb: "/projects/resonaid%20photos/iteration%201.jpg", thumbnail: "/projects/resonaid%20photos/Final%201.jpg", url: "/projects/resonaid.html",       problem: "Many people who would benefit from intervention are not getting tested in the first place.", tagline: "Making screening possible in hands that have no training at all is what changes the picture." },
  { n: "005", title: "S for Speaker",                   year: "2023", slug: "s-for-speaker",                          filter: "Industrial",    thumb: "https://framerusercontent.com/images/1NyRVGFxuRafyBm0DYpfsCsdE.png" },
  { n: "012", title: "Insync",                          year: "2025", slug: "insync",                                 filter: "UIUX",          thumb: "https://framerusercontent.com/images/ZWAwyL0WxVXgJmcRYQJc0obzIg.png" },
  { n: "008", title: "The Nature of Things Website",    year: "2024", slug: "the-nature-of-things-website",           filter: "UIUX",          thumb: "https://framerusercontent.com/images/IjpjrXsRYQAI0JfbA5OuQMyOWbM.png" },
  { n: "006", title: "Ollie the Lightning Cloud",       year: "2024", slug: "ollie-the-lightning-cloud",              filter: "UIUX",          thumb: "https://framerusercontent.com/images/btWDAf8WcfU0NbxqiNSDzkIPbTY.png" },
  { n: "003", title: "Sand Game",                       year: "2024", slug: "sand-game",                              filter: "UIUX",          thumb: "https://framerusercontent.com/images/7raukPO4arDkGNRjXh1ZYng0q3s.png" },
  { n: "004", title: "Wear & Tear",                     year: "2023", slug: "wear-tear",                              filter: "Communication", thumb: "https://framerusercontent.com/images/Atw0NnngKnXw3m4s40mGiTyPSY.jpg" },
  { n: "001", title: "RVRC",                            year: "2023", slug: "ridgeview-residential-college-designs",  filter: "Communication", thumb: "https://framerusercontent.com/images/ioO9Ak0uhMfWWQsNCiiwVkOrJQ.png" },
  { n: "009", title: "The Nature of Things Exhibition", year: "2024", slug: "the-nature-of-things-exhibition",        filter: "Interior",      thumb: "https://framerusercontent.com/images/LVeH0OeV7GCNV8agctbnticcYjs.jpg" },
  { n: "002", title: "Ethlas Office Renovation",        year: "2022", slug: "ethlas-office-renovation",               filter: "Interior",      thumb: "https://framerusercontent.com/images/cekUr70Lxg1A07jztFOvvRcPtU.jpg" },
]

export default PROJECTS
