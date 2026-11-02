# Q02 C1 — Product-Surface Clarification Ready for OpenAI Support (NOT SENT)

artifact_id: PP-002-Q02-C1-PLATFORM-SURFACE-CLARIFICATION
status: DRAFT READY / OWNER MAY SEND / NO PROVIDER REPLY YET
Owner_C1_approval: control/PP-002_Q02_C1_OWNER_EXTERNAL_EVIDENCE_APPROVAL.md
source_receipt: validations/PP-002/Q02-C1/C1_AI_SUPPORT_RESPONSE_SOURCE_RECEIPT.md
coordinator: PROJECT_CONTROL / PC-003
requested_data: EXISTING NONSECRET POLICY/FEATURE LIMITS ONLY
classification: NONSECRET / NO ACCOUNT OR CREDENTIAL VALUES

## Text ready to relay

Gracias. Distingo dos superficies diferentes:

1. **Superficie que usamos ahora:** conversaciones normales de ChatGPT/Projects. Tenemos distintos chats para Project Control, diseño y QA. Todos son roles de coordinación lógica, NO identidades separadas por sí mismos. Una conexión/herramienta de GitHub ya disponible a esos chats ha permitido publicaciones autorizadas en el repositorio. No es una conversación de Deep Research; estos mensajes de coordinación no son por sí mismos un proceso Codex/Work.
2. **Ejecutor experimental que queremos crear después:** un proceso offline y sin credenciales GitHub, ejecutado fuera de la conversación de coordinación en un entorno independiente todavía NO provisionado, con una ruta distinta y limitada de publicación posterior. Su substrate (Work/Codex o host externo) aún NO está seleccionado.

Queremos saber específicamente:
- Para la primera superficie, ¿hay una restricción técnica documentada y configurada que niegue por conversación (no solo con una instrucción en el prompt) el uso de una conexión GitHub privilegiada de la misma cuenta? Si NO, agradeceríamos confirmación con el producto/plan y alcance de esa afirmación.
- Para la segunda, ¿qué aislamiento es realmente verificable entre un ejecutor offline fuera del chat y esa conexión privilegiada, incluyendo herramientas alternativas, fallback, reinicios y cambio de cuenta? ¿Requiere runner externo o workspace/rol separado?
- El artículo https://help.openai.com/articles/11145903 describe la integración GitHub en ChatGPT como de lectura, mientras que en nuestro entorno hay una herramienta/plugin GitHub capaz de crear commits y actualizar refs autorizadas. ¿Qué producto o superficie documenta las capacidades de escritura de ese conector y qué restricciones de acceso se le pueden imponer? No solicitamos pruebas ni cambios de permisos.
- ¿Existen documentos oficiales, versiones de política o vías de validación independiente que permitan comprobar estas restricciones sin acceder a credenciales ni ejecutar escrituras de prueba?

Por favor no envíen tokens, información privada de sesiones, registros sensibles ni credenciales. Si la plataforma no ofrece ese control o no permite atestarlo, basta indicar expresamente la limitación y su alcance.

## Action boundary

This is a ready-to-send message for the Owner; it is not claimed sent by PC-003. Any answer later received is a new source, with attributable origin limitations and separate intake/QA gate. No ability to route through a private provider support channel is asserted.
