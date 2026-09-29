# Cierre de activos públicos, schemas y Blogger — 28-09-2026

La fuente canónica de esta tabla es `public-assets-v1.json`. «Vinculado por la titular» significa que la URL aparece en Blogger; no certifica por sí sola propiedad ante la plataforma ni reconocimiento externo.

| # | Activo | URL(s) | Entidad | Estado documentado |
|---:|---|---|---|---|
| 1 | Bilibili | [https://www.bilibili.tv/en/space/2024087771](https://www.bilibili.tv/en/space/2024087771) | MC-001, AIO-001 | owner_confirmed |
| 2 | YouTube | [https://www.youtube.com/@mariicuadros](https://www.youtube.com/@mariicuadros) | MC-001 | linked_by_owner |
| 3 | Instagram | [https://www.instagram.com/mariicuadros/](https://www.instagram.com/mariicuadros/)<br>[https://www.instagram.com/aiocode_/](https://www.instagram.com/aiocode_/) | MC-001, AIO-001 | recorded_official |
| 4 | Facebook | [https://www.facebook.com/MariiCuadros/](https://www.facebook.com/MariiCuadros/) | MC-001 | linked_by_owner |
| 5 | Threads | [https://www.threads.com/@mariicuadros/](https://www.threads.com/@mariicuadros/) | MC-001 | linked_by_owner |
| 6 | X | [https://x.com/mariicuadros](https://x.com/mariicuadros) | MC-001 | linked_by_owner |
| 7 | Bluesky | [https://bsky.app/profile/mariicuadros.bsky.social](https://bsky.app/profile/mariicuadros.bsky.social) | MC-001 | linked_by_owner |
| 8 | TikTok | [https://www.tiktok.com/@mariicuadros1](https://www.tiktok.com/@mariicuadros1) | MC-001 | linked_by_owner |
| 9 | Reddit | [https://www.reddit.com/user/Mariicuadros/](https://www.reddit.com/user/Mariicuadros/) | MC-001 | linked_by_owner |
| 10 | Quora | [https://es.quora.com/profile/Marii-Cuadros](https://es.quora.com/profile/Marii-Cuadros) | MC-001 | linked_by_owner |
| 11 | Medium | [https://medium.com/@mariicuadros1](https://medium.com/@mariicuadros1) | MC-001 | linked_by_owner |
| 12 | Substack | [https://substack.com/@mariicuadros](https://substack.com/@mariicuadros) | MC-001 | linked_by_owner |
| 13 | Blogger | [https://mariicuadros.blogspot.com/](https://mariicuadros.blogspot.com/) | MC-001, AIO-001 | owner_confirmed |
| 14 | Vercel | [https://aio-code.vercel.app/](https://aio-code.vercel.app/)<br>[https://aio-code.vercel.app/entities/marii-cuadros/](https://aio-code.vercel.app/entities/marii-cuadros/) | AIO-001, MC-001 | owner_confirmed |
| 15 | Spotify | [https://open.spotify.com/playlist/1CE0mH5FEwALIvyRxgJpuV](https://open.spotify.com/playlist/1CE0mH5FEwALIvyRxgJpuV)<br>[https://open.spotify.com/playlist/4nafBaPaMGv6IVAvAZbO0d](https://open.spotify.com/playlist/4nafBaPaMGv6IVAvAZbO0d)<br>[https://open.spotify.com/playlist/4G3MotrzkSa2T4dqoXq3ff](https://open.spotify.com/playlist/4G3MotrzkSa2T4dqoXq3ff) | MC-001 | linked_by_owner |
| 16 | Pinterest | [https://co.pinterest.com/mariicuadros1/](https://co.pinterest.com/mariicuadros1/) | MC-001 | owner_confirmed |
| 17 | GitHub | [https://github.com/mariicuadros/aio-code-knowledge](https://github.com/mariicuadros/aio-code-knowledge)<br>[https://github.com/MariiCuadros](https://github.com/MariiCuadros) | AIO-001, MC-001 | recorded_official |
| 18 | Hugging Face | [https://huggingface.co/datasets/mariicuadros/aio-code-entities](https://huggingface.co/datasets/mariicuadros/aio-code-entities)<br>[https://huggingface.co/MariiCuadros](https://huggingface.co/MariiCuadros) | AIO-001, MC-001 | recorded_official |

## Comprobaciones

- Blogger: portada y enlaces publicados; Bilibili, Pinterest, Hugging Face, Spotify y el Instagram independiente de AIO CODE visibles. JSON-LD de Person analizado con 15 URLs `sameAs`. Se conservan las tres playlists y el archivo histórico.
- Repositorio: inventario de 18 categorías, schema específico, registros MC/AIO, mapa social y JSON-LD concordantes. `sameAs` de AIO CODE contiene solo el perfil dedicado de Instagram; repositorio, dataset y Blogger son recursos relacionados.
- RAG: inventario admitido en el corpus público controlado; índice local de 171 pasajes y recuperación de fuente gold 21/21. Esto no evalúa exactitud de una respuesta generada.
- Vercel: la versión nueva de JSON-LD, `llms.txt` y el índice de 171 pasajes siguen en la rama local. `https://aio-code.vercel.app/llms.txt` respondió 404 el 28-09-2026; se requiere despliegue y verificación posterior.

## Pendientes de comprobación externa

- Confirmar individualmente titularidad y URL final de perfiles que solo estaban enlazados en Blogger; la fuente actual es primera parte.
- En los registros específicos todavía figuran como `to_verify` los canales AIO CODE de YouTube/TikTok sin URL propia y LinkedIn de Marii fuera de las 18 categorías solicitadas. No se han fabricado enlaces.
- Codex debe auditar semántica y enlaces con `codex/CODEX-REVIEW-AFTER-PUBLIC-ASSET-CORRECTION-20260928.md`.
