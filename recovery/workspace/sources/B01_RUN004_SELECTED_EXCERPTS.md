# B01 selected source excerpts — NON-AUTHORITATIVE

Source: QA-OLD-01 / QA_OLD_01_CHAT_PART_002.md; byte digest and Library ID in B01_SOURCE_MANIFEST.json.
Lines are 1-based in the supplied original, with CRLF normalized for display only. Disjoint excerpts; omissions between ranges are selection boundaries, not continuous text. Source has no machine-verifiable speaker boundaries.

## Original lines 5906–5935

```text
5906: QA REPORT — IMPLEMENTATION RUN 004
5907: RUN
5908: 
5909: IMPLEMENTATION RUN 004 — Art Variants + Read-Only Asset Indexer
5910: QA TARGET
5911: 
5912: Branch:
5913: 
5914: feature/workspace-run-004
5915: 
5916: SHA:
5917: 
5918: fa592117ccf4408a1a8e8552acafeae3b8e04d17
5919: 
5920: Baseline:
5921: 
5922: 017c904c22c7842fa1209e3e39885453dda1e63a
5923: RESULT
5924: 
5925: PARTIAL
5926: NEXT ACTION
5927: 
5928: RETURN TO DEVELOPMENT
5929: 
5930: Do NOT advance:
5931: 
5932: feature/workspace-v0.1
5933: 
5934: Do NOT modify:
5935: 
```

## Original lines 6320–6342

```text
6320: Summary:
6321: 
6322: AC-01 through AC-22  PASS
6323: AC-23                FAIL
6324: AC-24 through AC-44  PASS
6325: 
6326: Subject to revalidation of affected image criteria after correction.
6327: 
6328: Overall:
6329: 
6330: 43 PASS / 1 FAIL
6331: 
6332: A single failed acceptance criterion prevents RUN integration.
6333: 15. QA DECISION
6334: 
6335: RESULT: PARTIAL
6336: 
6337: NEXT ACTION: RETURN TO DEVELOPMENT
6338: 
6339: The implementation is structurally close to acceptance.
6340: 
6341: Required correction is localized to:
6342: 
```

## Original lines 6366–6405

```text
6366: QA RETURN — IMPLEMENTATION RUN 004
6367: RESULT
6368: 
6369: PARTIAL — RETURN TO DEVELOPMENT
6370: REPOSITORY
6371: 
6372: KhaosMagnus/YU3DOH-Carder
6373: BRANCH
6374: 
6375: Continue on:
6376: 
6377: feature/workspace-run-004
6378: 
6379: Do NOT recreate, reset, rebase or replace the branch.
6380: CURRENT QA-REJECTED SHA
6381: 
6382: fa592117ccf4408a1a8e8552acafeae3b8e04d17
6383: BASELINE REMAINS
6384: 
6385: feature/workspace-v0.1
6386: 
6387: 017c904c22c7842fa1209e3e39885453dda1e63a
6388: 
6389: Do NOT advance integration branch.
6390: 
6391: Do NOT modify main.
6392: BLOCKING FINDING
6393: QA-004-01 — BMP compressed payload not validated
6394: 
6395: Current inspectBmp() accepts compression modes:
6396: 
6397: 1
6398: 2
6399: 3
6400: 6
6401: 
6402: without decoding or otherwise proving the compressed pixel payload is valid.
6403: 
6404: Only:
6405: 
```

## Original lines 6549–6597

```text
6549:     native/non-native status;
6550: 
6551:     Windows frozen-install evidence.
6552: 
6553: DELIVERABLE
6554: 
6555: Return:
6556: 
6557: IMPLEMENTATION REPORT — RUN 004 QA CORRECTION
6558: 
6559: including:
6560: 
6561:     previous rejected SHA;
6562: 
6563:     correction commit(s);
6564: 
6565:     new final SHA;
6566: 
6567:     exact ancestry from original RUN baseline;
6568: 
6569:     precise root cause;
6570: 
6571:     chosen validation strategy;
6572: 
6573:     image formats/encodings now actually supported;
6574: 
6575:     behavior for unsupported encodings;
6576: 
6577:     new regression tests;
6578: 
6579:     complete test result;
6580: 
6581:     Windows Actions run;
6582: 
6583:     root compile/build;
6584: 
6585:     Workspace compile/tests;
6586: 
6587:     dependency changes or confirmation none;
6588: 
6589:     confirmation source Assets remain read-only;
6590: 
6591:     confirmation feature/workspace-v0.1 remains unchanged;
6592: 
6593:     confirmation main remains unchanged.
6594: 
6595: Do not integrate RUN 004.
6596: 
6597: The new SHA requires Diseño + QA revalidation.
```

## Original lines 6757–6800

```text
6757: - verifica CRC;
6758: - infla IDAT;
6759: - ejecuta unfilter;
6760: - recorre los samples reales;
6761: - soporta Adam7;
6762: - calcula transparencia real.
6763: 
6764: Se endureció la validación estructural de chunks y metadata obligatoria.
6765: 
6766: ---
6767: 
6768: 5. CORRECTION COMMITS
6769: 
6770: Functional correction
6771: 
6772: "02f6845e3893b1663ae23501ed611ff671f4b9a2"
6773: 
6774: Message:
6775: 
6776: "fix(workspace): require decodable indexed image payloads"
6777: 
6778: Parent exacto:
6779: 
6780: "fa592117ccf4408a1a8e8552acafeae3b8e04d17"
6781: 
6782: Windows validation workflow
6783: 
6784: "39134cbc5f87f296d9cb03482ffe93cc2a96e0cb"
6785: 
6786: Message:
6787: 
6788: "chore(validation): validate RUN 004 QA correction on Windows"
6789: 
6790: Validation cleanup
6791: 
6792: "81c20eb1477e1a0151b6e590d1e31390d82c6de4"
6793: 
6794: Message:
6795: 
6796: "chore(validation): finalize RUN 004 QA correction validation"
6797: 
6798: Este último commit elimina únicamente el workflow temporal.
6799: 
6800: ---
```

## Original lines 7542–7578

```text
7542: QA REPORT — IMPLEMENTATION RUN 004
7543: RUN
7544: 
7545: IMPLEMENTATION RUN 004 — Art Variants + Read-Only Asset Indexer
7546: REVALIDATION TARGET
7547: 
7548: Branch:
7549: 
7550: feature/workspace-run-004
7551: 
7552: Final SHA:
7553: 
7554: 81c20eb1477e1a0151b6e590d1e31390d82c6de4
7555: 
7556: Original baseline:
7557: 
7558: 017c904c22c7842fa1209e3e39885453dda1e63a
7559: 
7560: Previous QA-rejected SHA:
7561: 
7562: fa592117ccf4408a1a8e8552acafeae3b8e04d17
7563: RESULT
7564: 
7565: PASS
7566: NEXT ACTION
7567: 
7568: CLOSE RUN
7569: 
7570: RUN 004 may now be incorporated into:
7571: 
7572: feature/workspace-v0.1
7573: 
7574: by direct fast-forward, subject to final remote-ref verification.
7575: 
7576: main must remain unchanged.
7577: 1. REPOSITORY / ANCESTRY
7578: 
```

## Original lines 7940–7995

```text
7940: 
7941:     absence of Managed Asset Ingest;
7942: 
7943:     absence of composition transforms;
7944: 
7945:     absence of Library UI;
7946: 
7947:     absence of Carder bridge/render modifications.
7948: 
7949: 12. ACCEPTANCE CRITERIA
7950: 
7951: The previous QA result was:
7952: 
7953: 43 PASS
7954: 1 FAIL
7955: 
7956: with only:
7957: 
7958: AC-23 — Corrupt image handling
7959: 
7960: failed.
7961: 
7962: After correction:
7963: 
7964: AC-01 through AC-44
7965: = PASS
7966: 
7967: Final:
7968: 
7969: 44 / 44 PASS
7970: 13. FINAL QA DECISION
7971: 
7972: RESULT: PASS
7973: 
7974: NEXT ACTION: CLOSE RUN
7975: 
7976: Validated checkpoint:
7977: 
7978: 81c20eb1477e1a0151b6e590d1e31390d82c6de4
7979: 
7980: RUN 004 is formally accepted.
7981: 
7982: Authorized next integration:
7983: 
7984: feature/workspace-v0.1
7985: 017c904c22c7842fa1209e3e39885453dda1e63a
7986: 
7987:         ↓ fast-forward
7988: 
7989: 81c20eb1477e1a0151b6e590d1e31390d82c6de4
7990: 
7991: No administrative merge commit is required.
7992: 
7993: main must remain:
7994: 
7995: 54cc3aad246c89a29f2a18be63c539db68cae041
```

## Original lines 7998–8059

```text
7998: HANDOFF ADMINISTRATIVO — INCORPORAR RUN 004 A WORKSPACE v0.1
7999: REPOSITORY
8000: 
8001: KhaosMagnus/YU3DOH-Carder
8002: QA RESULT
8003: 
8004: IMPLEMENTATION RUN 004 — Art Variants + Read-Only Asset Indexer
8005: 
8006: Result:
8007: 
8008: PASS
8009: 
8010: Validated SHA:
8011: 
8012: 81c20eb1477e1a0151b6e590d1e31390d82c6de4
8013: CURRENT EXPECTED REFS
8014: 
8015: Before modifying any ref, verify remotely:
8016: 
8017: feature/workspace-v0.1
8018: = 017c904c22c7842fa1209e3e39885453dda1e63a
8019: 
8020: feature/workspace-run-004
8021: = 81c20eb1477e1a0151b6e590d1e31390d82c6de4
8022: 
8023: main
8024: = 54cc3aad246c89a29f2a18be63c539db68cae041
8025: 
8026: REQUIRED ANCESTRY
8027: 
8028: Verify:
8029: 
8030: base:
8031: 017c904c22c7842fa1209e3e39885453dda1e63a
8032: 
8033: head:
8034: 81c20eb1477e1a0151b6e590d1e31390d82c6de4
8035: 
8036: Expected:
8037: 
8038: ahead_by  = 9
8039: behind_by = 0
8040: 
8041: merge-base:
8042: 017c904c22c7842fa1209e3e39885453dda1e63a
8043: 
8044: If this does not match:
8045: 
8046: STOP — RETURN TO DESIGN + QA
8047: REQUIRED OPERATION
8048: 
8049: Advance:
8050: 
8051: feature/workspace-v0.1
8052: 
8053: by direct fast-forward to:
8054: 
8055: 81c20eb1477e1a0151b6e590d1e31390d82c6de4
8056: 
8057: No additional content changes are required.
8058: RESTRICTIONS
8059: 
```

## Original lines 8078–8089

```text
8078: POST-OPERATION VERIFICATION
8079: 
8080: Expected final remote state:
8081: 
8082: feature/workspace-v0.1
8083: = 81c20eb1477e1a0151b6e590d1e31390d82c6de4
8084: 
8085: feature/workspace-run-004
8086: = 81c20eb1477e1a0151b6e590d1e31390d82c6de4
8087: 
8088: main
8089: = 54cc3aad246c89a29f2a18be63c539db68cae041
```

## Original lines 8132–8162

```text
8132: RESULTADO
8133: 
8134: RUN 004 CERRADO E INCORPORADO MEDIANTE FAST-FORWARD
8135: 
8136: Repositorio:
8137: 
8138: "KhaosMagnus/YU3DOH-Carder"
8139: 
8140: Estado previo verificado
8141: 
8142: "feature/workspace-v0.1"
8143: "017c904c22c7842fa1209e3e39885453dda1e63a"
8144: 
8145: "feature/workspace-run-004"
8146: "81c20eb1477e1a0151b6e590d1e31390d82c6de4"
8147: 
8148: "main"
8149: "54cc3aad246c89a29f2a18be63c539db68cae041"
8150: 
8151: Ancestry previo
8152: 
8153: Base:
8154: 
8155: "017c904c22c7842fa1209e3e39885453dda1e63a"
8156: 
8157: Head:
8158: 
8159: "81c20eb1477e1a0151b6e590d1e31390d82c6de4"
8160: 
8161: Resultado:
8162: 
```

## Original lines 8170–8227

```text
8170: Fast-forward directo de ref
8171: 
8172: "feature/workspace-v0.1"
8173: 
8174: desde:
8175: 
8176: "017c904c22c7842fa1209e3e39885453dda1e63a"
8177: 
8178: hasta:
8179: 
8180: "81c20eb1477e1a0151b6e590d1e31390d82c6de4"
8181: 
8182: Se utilizó verificación del SHA previo antes de mover la ref.
8183: 
8184: - merge commit administrativo: NO
8185: - squash: NO
8186: - rebase: NO
8187: - force-push: NO
8188: - archivos modificados durante la integración: NO
8189: - commit administrativo creado: NO
8190: 
8191: Estado remoto final verificado
8192: 
8193: "feature/workspace-v0.1"
8194: "81c20eb1477e1a0151b6e590d1e31390d82c6de4"
8195: 
8196: "feature/workspace-run-004"
8197: "81c20eb1477e1a0151b6e590d1e31390d82c6de4"
8198: 
8199: "main"
8200: "54cc3aad246c89a29f2a18be63c539db68cae041"
8201: 
8202: Comparación final:
8203: 
8204: "feature/workspace-v0.1" ↔ "feature/workspace-run-004"
8205: 
8206: - "status: identical"
8207: - "ahead_by: 0"
8208: - "behind_by: 0"
8209: - merge-base: "81c20eb1477e1a0151b6e590d1e31390d82c6de4"
8210: 
8211: Confirmaciones
8212: 
8213: - SHA previo de "feature/workspace-v0.1": "017c904c22c7842fa1209e3e39885453dda1e63a"
8214: - SHA QA-validado RUN 004: "81c20eb1477e1a0151b6e590d1e31390d82c6de4"
8215: - SHA final remoto de "feature/workspace-v0.1": "81c20eb1477e1a0151b6e590d1e31390d82c6de4"
8216: - commit administrativo creado: NO
8217: - "main" intacto: SÍ
8218: - "feature/workspace-run-004" conservada en su SHA validado: SÍ
8219: 
8220: RUN 004 queda formalmente cerrado e incorporado al checkpoint de integración "feature/workspace-v0.1".
8221: …
8222: 
8223: 
8224: Pasted text(20261010-074733).txtDocument
8225: 
8226: BLOCKED — STOP / RETURN TO DESIGN + QA
8227: Reproduje una contradicción con AC-72: crear un Draft con el password del archivo unresolved provoca binding automático durante el scan previo a ATTACH. ATTACH falla con ASSET_STATE_STALE, pero el asset ya queda RESOLVED y Standard READY.
```
