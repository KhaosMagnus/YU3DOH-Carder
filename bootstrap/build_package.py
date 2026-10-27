#!/usr/bin/env python3
"""Rebuild and verify the ZIP using only the Python standard library."""
from pathlib import Path
import hashlib
import io
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent
NAME = 'PROJECT_CONTROL_BOOTSTRAP-v1.0'
SOURCE = ROOT / NAME
PIN = 'bd1840bf0b1dc8e294af1226ec6cfb0546f7bc89'
PROTOCOL = 'protocol/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md'
REQUIRED = {'START_HERE.md', PROTOCOL, 'PACKAGE_METADATA.md',
            'adapters/GITHUB_DEFAULT.md'} | {
    'templates/' + name + '.md' for name in (
        'PROJECT_STATE', 'ROLE_REGISTRY', 'INSTANCE_REGISTRY',
        'REQUEST_LEDGER', 'TRANSFER_ENVELOPE', 'BOOTSTRAP_RETURN')}

def digest(data):
    return hashlib.sha256(data).hexdigest()

paths = [p for p in SOURCE.rglob('*') if p.is_file()]
assert not any(p.is_symlink() for p in SOURCE.rglob('*')), 'Symlink forbidden'
payload = {p.relative_to(SOURCE).as_posix(): p.read_bytes()
           for p in paths if p.name != 'MANIFEST.sha256'}
assert set(payload) == REQUIRED, (set(payload) - REQUIRED, REQUIRED - set(payload))
frozen = subprocess.check_output(
    ['git', 'show', PIN + ':protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md'],
    cwd=ROOT.parent)
assert payload[PROTOCOL] == frozen, 'Frozen protocol differs'
manifest = ''.join(digest(payload[name]) + '  ' + name + '\n'
                   for name in sorted(payload)).encode('utf-8')
(SOURCE / 'MANIFEST.sha256').write_bytes(manifest)
for line in manifest.decode().splitlines():
    expected, name = line.split('  ', 1)
    assert digest((SOURCE / name).read_bytes()) == expected
payload['MANIFEST.sha256'] = manifest

def archive_bytes():
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w', compression=zipfile.ZIP_STORED) as archive:
        for name in sorted(payload):
            info = zipfile.ZipInfo(NAME + '/' + name, (1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_STORED
            archive.writestr(info, payload[name])
    return stream.getvalue()

result = archive_bytes()
assert result == archive_bytes(), 'Non-deterministic output'
with zipfile.ZipFile(io.BytesIO(result)) as archive:
    assert archive.testzip() is None
    expected_names = {NAME + '/' + n for n in payload}
    assert set(archive.namelist()) == expected_names
    assert len(archive.namelist()) == len(expected_names)
    for name, data in payload.items():
        assert archive.read(NAME + '/' + name) == data
DIST = ROOT / 'dist'
DIST.mkdir(exist_ok=True)
output = DIST / (NAME + '.zip')
output.write_bytes(result)
checksum = digest(result)
(DIST / (NAME + '.zip.sha256')).write_text(
    checksum + '  ' + output.name + '\n', encoding='ascii')
assert output.read_bytes() == result
assert (DIST / (NAME + '.zip.sha256')).read_text().split()[0] == digest(output.read_bytes())
print('PASS: required files, frozen bytes, 10 manifest entries, 11 ZIP members, CRC, exact source/archive equality, repeat build, ZIP digest')
print('Protocol SHA-256:', digest(frozen))
print('ZIP SHA-256:', checksum)
print('ZIP bytes:', len(result))
