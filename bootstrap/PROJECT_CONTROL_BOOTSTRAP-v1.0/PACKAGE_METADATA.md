# Package metadata

PACKAGE: Project Control Bootstrap
VERSION: 1.0
PURPOSE: portable governance initialization; no automatic adoption or product action
PAYLOAD: START_HERE, one frozen protocol, six templates, one optional GitHub adapter, this metadata, manifest
PROTOCOL: Generic Project Control Protocol v1.0 — FROZEN
PROTOCOL SHA-256: 586cb4d8740e33ac8a3a6db65a5ce1506fe855ca1968adacd3034352106c70e3
PROTOCOL SOURCE REVISION: bd1840bf0b1dc8e294af1226ec6cfb0546f7bc89
SOURCE PATH: protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md

The source revision is provenance of this distribution, never the adopting project's baseline or control revision. Embedded extraction identifiers, historical review references and “SIP” wording in the frozen protocol remain historical provenance. The included protocol is self-contained for adoption; its source review is not a required runtime dependency. No source-project repository, product, branch, actor, schema, test command or history is required. Replace adopter template placeholders from actual inspection and authorized decisions. No real project has been bootstrapped by creation of this package.

## Integrity and reproducible container

MANIFEST.sha256 lists all ten payload files except itself, using SHA-256, two spaces and POSIX-relative paths, sorted lexicographically. It cannot hash itself. Verify all entries and reject unlisted payload. ZIP SHA-256 is supplied outside the archive to avoid a digest cycle. Verify publisher authenticity separately; checksums alone do not authenticate an author.

Archive layout has one root directory, PROJECT_CONTROL_BOOTSTRAP-v1.0, and eleven file entries; no explicit directory entries. Entry order: lexicographic relative path. Each entry uses uncompressed ZIP_STORED, timestamp 1980-01-01 00:00:00, Unix create_system=3, external_attr=0o100644 shifted left 16, no comments or extra fields. Source file bytes are preserved. UTF-8 text uses LF. Fixed metadata and no compression make builds reproducible without compressor-version dependence.

Publisher rebuild/verification command from its repository root: `python3 bootstrap/build_package.py`. That reviewable standard-library builder is outside this minimal payload; it also compares the protocol to the pinned Git object. Recipients need no builder or source repository to adopt: verify the supplied manifest and outer digest using any equivalent SHA-256/ZIP tools. To reproduce the ZIP independently, recompute the manifest as above and write these exact file bytes with the specified ZIP entry settings (Python standard-library ZipInfo/ZipFile is sufficient).

Status: assembly ready for review; no independent QA verdict or product acceptance claimed. Changes after publication require a versioned successor and explicit provenance; do not mutate this distribution while retaining its digest/version identity.
