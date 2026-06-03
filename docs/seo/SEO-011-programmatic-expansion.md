# SEO-011 Programmatic SEO Expansion and Internal Link Optimization

## Summary

| Item | Result | Notes |
| --- | --- | --- |
| Score | 88/100 | Based on local export internal links and programmatic page coverage |
| Final Recommendation | Passed with Issues | Read-only report; no code changes applied |
| HTML files scanned | 601 | `apps/dockdocs/out/**/*.html` |
| Guide pages | 158 | Programmatic and static guide routes |
| Resource pages | 4 | Programmatic resource routes |
| Blog pages | 13 | Blog article routes |
| Core orphan pages | 0 | Core route graph |

## SEO-008 Internal Link Optimization Findings

| URL | Internal Links In | Internal Links Out | Linked From Homepage | Orphan | Core Links Out |
| --- | --- | --- | --- | --- | --- |
| `/` | 10 | 3 | Yes | No | `/`, `/pdf-to-word/`, `/compress-pdf/` |
| `/compress-pdf/` | 8 | 1 | Yes | No | `/` |
| `/merge-pdf/` | 5 | 7 | No | No | `/`, `/resources/`, `/guides/`, `/compress-pdf/`, `/split-pdf/`, `/pdf-to-word/`, `/ocr-pdf/` |
| `/split-pdf/` | 5 | 7 | No | No | `/`, `/resources/`, `/guides/`, `/compress-pdf/`, `/merge-pdf/`, `/pdf-to-word/`, `/ocr-pdf/` |
| `/pdf-to-word/` | 8 | 1 | Yes | No | `/` |
| `/ocr-pdf/` | 5 | 7 | No | No | `/`, `/resources/`, `/guides/`, `/compress-pdf/`, `/merge-pdf/`, `/split-pdf/`, `/pdf-to-word/` |
| `/ai-workspace/` | 1 | 6 | No | No | `/`, `/ocr-pdf/`, `/compress-pdf/`, `/merge-pdf/`, `/split-pdf/`, `/pdf-to-word/` |
| `/guides/` | 4 | 7 | No | No | `/`, `/compress-pdf/`, `/resources/`, `/merge-pdf/`, `/split-pdf/`, `/pdf-to-word/`, `/blog/` |
| `/resources/` | 5 | 8 | No | No | `/`, `/blog/`, `/compress-pdf/`, `/merge-pdf/`, `/split-pdf/`, `/pdf-to-word/`, `/ocr-pdf/`, `/ai-workspace/` |
| `/blog/` | 2 | 6 | No | No | `/`, `/compress-pdf/`, `/pdf-to-word/`, `/ocr-pdf/`, `/resources/`, `/guides/` |

## Internal Link Issues

| URL / Scope | Issue | Severity | Recommendation |
| --- | --- | --- | --- |
| `/` | Homepage missing core links: /merge-pdf/, /split-pdf/, /ocr-pdf/, /ai-workspace/, /guides/, /resources/, /blog/ | P1 | Add homepage/nav/footer entries for missing core pages. |
| `/guides/` | Hub missing tool links: /ocr-pdf/ | P2 | Add relevant tool links to hub content. |
| `/blog/` | Hub missing tool links: /merge-pdf/, /split-pdf/ | P2 | Add relevant tool links to hub content. |
| `Tool pages` | Weak tool-to-tool interlinking: /compress-pdf/, /pdf-to-word/ | P2 | Add related workflows between tool pages. |

## Programmatic SEO Coverage

| Surface | Count | Cluster Notes |
| --- | --- | --- |
| Guides | 158 | {"compress":15,"merge":3,"split":3,"ocr":30,"word":2,"ai":58,"other":47} |
| Resources | 4 | {"compress":1,"merge":0,"split":0,"ocr":1,"word":0,"ai":1,"other":1} |
| Blog | 13 | {"compress":3,"merge":2,"split":1,"ocr":3,"word":2,"ai":0,"other":2} |

## Programmatic Expansion Opportunities

| Area | Finding | Recommendation |
| --- | --- | --- |
| Guides | Merge PDF support content is thinner than compression/OCR clusters | Add more merge PDF guides around ordering, privacy, file limits, and use cases. |
| Guides | PDF to Word guide coverage can expand | Add guides for editable DOCX, formatting preservation, scanned PDFs, and OCR-before-conversion workflows. |
| Resources | Resource hub has fewer programmatic pages than guides | Add resource-style Q&A pages for each high-intent PDF workflow cluster. |
| Blog | Blog article count remains modest for query capture | Add focused evergreen posts for high-intent workflows before broad expansion. |

## Recommended Next Step

Prioritize fixing the remaining SEO-008 internal link issues before creating new programmatic pages. Use GSC query and impression data before large-scale expansion, because current analysis is based on crawlable page inventory rather than real search demand.

## Final Recommendation

Passed with Issues
