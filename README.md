# Laboratory of Quantum Integrability

This repository contains the website for the Laboratory of Quantum Integrability, led by Professor JIANG Yunfeng at Southeast University.

Our group studies integrability and its applications across mathematical physics. Our research includes integrable models, quantum field theory, the AdS/CFT correspondence, solvable $T\bar{T}$ deformations, and related algebraic structures. The website collects information about our people, research publications, lectures, news, and events.

## Development

The site is built with [Astro](https://astro.build/) and uses content collections for publications, people, lectures, news, and events.

Install dependencies:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

Build the static site:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

The generated site is written to `dist/`.

Run all checks before opening a pull request:

```sh
npm run validate
```

This runs Astro's type checker, regression tests, the production build, and a
check of the generated pages for broken local links, missing anchors, duplicate
IDs, and invalid metadata. Pull requests to `dev` and `main`, and pushes to
`dev`, run these checks automatically. Deployment to GitHub Pages also runs them.

## Content conventions

- Content collections load Markdown (`.md`) files. MDX (`.mdx`) combines Markdown
  with components and requires an MDX integration before it can be enabled here.
- All displayed dates and copyright years use Beijing time (`Asia/Shanghai`),
  regardless of the machine or CI runner's timezone.
- Inline formulas delimited by `$...$` render as native MathML in page headings
  and lists, using KaTeX at build time. Browser titles, search descriptions, and
  social metadata use readable Unicode notation such as `TT̄` and `D₈⁽¹⁾`, because
  those fields cannot contain rendered HTML or MathML. No client math script or
  font download is required.
- News, events, and lectures can set `language: "zh-CN"`; the default is `en`.
- Images remain in `public/images/` and are served as supplied.

The site includes canonical URLs, social metadata, and a sitemap at
`/sitemap-index.xml`. The old `/events/` entry redirects to `/news/#updates`.
