"""Pure request/response capture. No transport, credentials, filesystem or publisher."""
from copy import deepcopy

UNKNOWN = "UNKNOWN"
ARGUMENT_KEYS = ("repository_full_name", "path", "ref", "url")


def capture_request(explicit_arguments, request_source, clock):
    """Caller must persist/pin this returned envelope before a future transport call."""
    if not isinstance(explicit_arguments, dict) or not request_source:
        raise ValueError("Explicit arguments and a nonempty correlation ID required")
    return {
        "schema_version": "Q01-capture-v1",
        "retrieval_id": str(request_source),
        "capture_origin": "AT_ISSUANCE_RECEIPT",
        "arguments": {key: deepcopy(explicit_arguments.get(key, UNKNOWN)) for key in ARGUMENT_KEYS},
        "requested_at": clock(),
    }


def ingest_response(request_envelope, raw_receipt, receipt_source, clock):
    """Do not infer response/nonemission state or fill request fields from a result."""
    if not request_envelope.get("retrieval_id") or not receipt_source:
        raise ValueError("Request correlation and receipt source required")
    return {
        "schema_version": "Q01-capture-v1",
        "retrieval_id": request_envelope["retrieval_id"],
        "request_source_id": request_envelope["retrieval_id"],
        "receipt_source_id": str(receipt_source),
        "capture_origin": "RETAINED_RESPONSE",
        "receipt_at": clock(),
        "response": deepcopy(raw_receipt),
    }

