# INSPIRE publication import

Imported on October 1, 2026 from [Yunfeng Jiang's INSPIRE profile](https://inspirehep.net/authors/1327440?ui-citation-summary=true), using the author identifier `Yun.Feng.Jiang.1`.

- Retrieved all 62 records in one API response, with no remaining pagination.
- Added 52 published papers and retained the 5 existing papers: 57 in total.
- Excluded 5 records without journal publication information.
- Matched records by INSPIRE ID, DOI, arXiv ID, and normalized title to avoid duplicates.
- Grouped papers by journal publication year, rather than preprint year.
- Kept errata with their original papers and removed repeated names within author lists.
- Each entry includes its INSPIRE record link and available DOI/arXiv links. Existing descriptions were retained; no new summaries were invented.

INSPIRE's `published` filter returns 56 records. It does not yet include the existing paper “Rational Q-systems for Integrable Spin Chains without U(1) Symmetry”. Its publication on June 22, 2026 is confirmed by [SciPost Physics](https://scipost.org/SciPostPhys.20.6.175), so it remains included.

The source was retrieved with:

```powershell
smart-search fetch 'https://inspirehep.net/authors/1327440?ui-citation-summary=true' --format json
smart-search fetch 'https://inspirehep.net/api/literature?q=a%20Yun.Feng.Jiang.1&size=250&sort=mostrecent&fields=titles,authors,publication_info,dois,arxiv_eprints,document_type,imprints,control_number' --format json
smart-search fetch 'https://scipost.org/SciPostPhys.20.6.175' --format json
```
