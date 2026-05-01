"""Domain-level errors mapped to HTTP in the API layer."""


class AppError(Exception):
    """Base application error with optional HTTP status hint."""

    status_code: int = 500
    code: str = "internal_error"

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class ConfigurationError(AppError):
    status_code = 500
    code = "configuration_error"


class MissingOpenAIKeyError(AppError):
    """서버는 기동되나 RAG/업로드에 필요한 키가 없을 때."""

    status_code = 503
    code = "missing_openai_api_key"


class EmptyDocumentError(AppError):
    status_code = 400
    code = "empty_document"


class BadInputError(AppError):
    status_code = 400
    code = "bad_input"


class UpstreamTimeoutError(AppError):
    status_code = 504
    code = "upstream_timeout"


class UpstreamError(AppError):
    status_code = 502
    code = "upstream_error"


class OpenAIQuotaExceededError(AppError):
    """429 insufficient_quota — 결제·크레딧·플랜 한도 문제."""

    status_code = 503
    code = "openai_insufficient_quota"
