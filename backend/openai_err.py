"""Map OpenAI SDK exceptions to application errors with clearer Korean messages."""

from __future__ import annotations

import logging
from typing import NoReturn

from openai import APIError, APITimeoutError, OpenAIError, RateLimitError

from exceptions import OpenAIQuotaExceededError, UpstreamError, UpstreamTimeoutError

logger = logging.getLogger(__name__)

_QUOTA_HINT = (
    "OpenAI 계정의 사용 한도(quota)가 없거나 결제·크레딧이 부족합니다. "
    "https://platform.openai.com/account/billing 에서 결제 수단·요금제·한도를 확인하세요."
)


def _is_insufficient_quota(exc: BaseException) -> bool:
    if "insufficient_quota" in str(exc).lower():
        return True
    body = getattr(exc, "body", None)
    if isinstance(body, dict):
        err = body.get("error")
        if isinstance(err, dict) and err.get("code") == "insufficient_quota":
            return True
    return False


def raise_for_openai(exc: BaseException, *, what: str) -> NoReturn:
    """Re-raise as domain errors. `what` is a short Korean label e.g. \"임베딩\", \"채팅\"."""
    if isinstance(exc, APITimeoutError):
        logger.exception("OpenAI timeout (%s)", what)
        raise UpstreamTimeoutError(f"{what} API 시간 초과") from exc

    if isinstance(exc, RateLimitError):
        logger.exception("OpenAI rate limit (%s)", what)
        if _is_insufficient_quota(exc):
            raise OpenAIQuotaExceededError(_QUOTA_HINT) from exc
        raise UpstreamError(
            f"{what}: 요청이 너무 많습니다. 잠시 후 다시 시도하거나 "
            "https://platform.openai.com/account/limits 에서 한도를 확인하세요."
        ) from exc

    if isinstance(exc, APIError):
        logger.exception("OpenAI API error (%s)", what)
        if getattr(exc, "status_code", None) == 429 and _is_insufficient_quota(exc):
            raise OpenAIQuotaExceededError(_QUOTA_HINT) from exc
        raise UpstreamError(f"{what} API 오류: {exc}") from exc

    if isinstance(exc, OpenAIError):
        logger.exception("OpenAI error (%s)", what)
        raise UpstreamError(f"{what} API 오류: {exc}") from exc

    raise exc
