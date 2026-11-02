# C1 — Exact GitHub Hybrid Plugin Follow-up to AI Support (NOT SENT)

artifact_id: PP-002-Q02-C1-GITHUB-HYBRID-SUPPORT-FOLLOWUP
status: NONSECRET DRAFT / OWNER MAY SEND / NOT YET DELIVERED
source_control: a6f52874aaf5d78a8d221cfd9023dbe3816fe652
source_receipt: validations/PP-002/Q02-C1/C1_SECOND_AI_SUPPORT_REPLY_AND_GITHUB_PLUGIN_IDENTITY_RECEIPT.md
coordinator: PROJECT_CONTROL / PC-003

## Message ready for support

Gracias. Revisamos directamente la herramienta que emplea nuestro Project Control.

- Plugin instalado/habilitado en ChatGPT: **GitHub**.
- Identificador de plugin: `plugin_connector_1p_1a69035c238881919c4190932b2df699`.
- Descripción mostrada: "Inspect repositories, triage pull requests and issues, debug CI, and publish changes through a hybrid GitHub connector and CLI workflow."
- Namespace visible de herramientas: `mcp__GitHub__`.
- Acciones de escritura disponibles y utilizadas para publicaciones autorizadas de documentación: `create_tree`, `create_commit`, `update_ref` sobre `meta/project-control` en `KhaosMagnus/YU3DOH-Carder`.
- Preferencia de confirmación: GitHub "Allow all actions"; global "Allow low-risk actions". No se modificó nada.

No hemos creado ni identificado un servidor MCP personalizado; el nombre interno de herramientas no demuestra que la app sea MCP custom. Tampoco hemos determinado qué GitHub App registration ID ni qué modo de token firma cada llamada.

**Necesitamos una aclaración acotada:** ¿el identificador de plugin anterior corresponde a la integración oficial GitHub con flujo de publicación híbrido, a una variante de conector, o a otra superficie distinta de la integración de solo lectura descrita en https://help.openai.com/articles/11145903? ¿Qué controles de restricción de acciones y de repositorio/identidad se documentan para esta variante? ¿Puede un usuario imponer por conversación un rechazo técnico de esas herramientas de escritura o debe separar ejecutor y credencial/conexión mediante un ambiente externo o un workspace/rol con controles efectivos?

Nuestro ejecutor experimental todavía es un diseño futuro: **offline, fuera de la conexión privilegiada**, sin host ni token aprovisionado. No se ejecuta actualmente mediante un chat normal ni hemos seleccionado Work/Codex.

Por favor indiquen documentación de producto/versión, alcance de la respuesta y si puede corroborarse una restricción real de selección de herramienta/credenciales entre contextos; o expresamente "no soportado / no verificable". No solicitamos credenciales, valores de token, sesión, pruebas de escritura, cambios de configuración ni acceso interno sensible.

## Authority limits

This draft has not been sent. Public plugin display ID and action names are not a GitHub App registration, credential, per-call signer or provider security attestation. No current settings, connection or account is to be modified to answer.
