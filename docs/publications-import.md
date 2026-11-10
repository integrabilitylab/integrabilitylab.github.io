# INSPIRE publication import

Last synchronized on November 10, 2026 from [Yunfeng Jiang's INSPIRE profile](https://inspirehep.net/authors/1327440?ui-citation-summary=true), using the author identifier `Yun.Feng.Jiang.1`.

- Retrieved all 63 records in one API response, with no remaining pagination.
- Added 2 newly published papers to the existing 57 papers: 59 in total, matching INSPIRE's current published count.
- Excluded 4 records without journal publication information.
- Matched records by INSPIRE ID, DOI, arXiv ID, and normalized title to avoid duplicates.
- Grouped papers by journal publication year, rather than preprint year.
- Kept errata with their original papers and removed repeated names within author lists.
- Each entry includes its INSPIRE record link and available DOI/arXiv links. Existing descriptions were retained; no new summaries were invented.

The two additions are:

| Paper | Publication | INSPIRE |
| --- | --- | --- |
| Quantum entanglement of Bethe states | Journal of Statistical Mechanics: Theory and Experiment 2026 (10), 103103 | [3168438](https://inspirehep.net/literature/3168438) |
| The Roaming Bethe Roots: An Effective Bethe Ansatz Beyond Integrability | Chinese Physics Letters 43 (10), 100001 (2026) | [3139366](https://inspirehep.net/literature/3139366) |

Both were published in October 2026. The [JSTAT publisher page](https://doi.org/10.1088/1742-5468/aeab75) and [Chinese Physics Letters publisher page](https://cpl.iphy.ac.cn/article/doi/10.1088/0256-307X/43/10/100001) confirm their titles, authors and DOIs. The new entries appear first within 2026, and consequently also appear in the homepage's latest publications.

The publication years, volumes, article/page numbers, DOIs and arXiv identifiers of the existing 57 entries still match INSPIRE. INSPIRE now includes journal information for “Rational Q-systems for Integrable Spin Chains without U(1) Symmetry”, which was previously verified directly with [SciPost Physics](https://scipost.org/SciPostPhys.20.6.175).

The original import on October 1, 2026 retrieved 62 records, added 52 published papers to 5 existing entries, and excluded 5 records without journal publication information.

The source was retrieved with:

```powershell
smart-search fetch 'https://inspirehep.net/authors/1327440?ui-citation-summary=true' --format json
smart-search fetch 'https://inspirehep.net/api/literature?q=a%20Yun.Feng.Jiang.1&size=250&sort=mostrecent&fields=titles,authors,publication_info,dois,arxiv_eprints,document_type,imprints,control_number' --format json
smart-search fetch 'https://doi.org/10.1088/1742-5468/aeab75' --format json
smart-search fetch 'https://cpl.iphy.ac.cn/article/doi/10.1088/0256-307X/43/10/100001' --format json
```
