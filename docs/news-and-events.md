# News & Events content format

News and event detail pages use the same fixed structure:

1. Publication date
2. Title
3. One-sentence summary
4. Location (events, when available)
5. Image or poster (when available)
6. Markdown body

The shared layout controls title wrapping, metadata placement, image spacing, and typography. Do not add custom HTML or inline styles for these elements in individual entries.

## Frontmatter rules

- `title` is required and limited to 120 characters. Keep it concise; do not repeat dates or locations already shown elsewhere on the page.
- `date` is the publication or announcement date, used for ordering News & Events. For an event, it is not necessarily the event start date.
- `summary` is required, limited to 220 characters, and should normally be one sentence. Move registration details, schedules, and other specifics into the body.
- `language` defaults to `en`. Set `language: "zh-CN"` only for Chinese content.
- `image` is optional and points to a file under `public/images/news/` or `public/images/events/`.
- `location` is optional for events and appears above the image with a `Location:` label.

Astro validates the title and summary constraints during `npm run check` and `npm run build`.

## Event template

Use `src/content/events/YYYY-short-description.md`:

```md
---
title: "Concise Event Title"
date: YYYY-MM-DD
location: "Venue, Institution"
summary: "A one-sentence overview of the event and its host or organizer."
image: "/images/events/event-image.jpg"
---

Start with a paragraph describing the event and its academic context.

- **Dates:** Event dates and registration or departure arrangements
- **Venue:** Full venue
- **Hosts:** Host institutions

[Event notice (PDF)](/files/events/event-notice.pdf) · [Original announcement](https://example.edu/notice)
```

Omit `image`, `location`, or inapplicable detail rows rather than adding placeholder text. Store event PDFs under `public/files/events/`.

## News template

Use `src/content/news/YYYY-MM-DD-short-description.md`:

```md
---
title: "Concise News Title"
date: YYYY-MM-DD
summary: "A one-sentence overview of the result, announcement, or activity."
image: "/images/news/news-image.jpg"
---

Start with the main news and the people or groups involved. Add publication details, context, and source links in the following paragraphs.
```

The image field is optional for news. Put the essential information in the text so the entry remains complete without an image.
