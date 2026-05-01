"""OpenAI Chat Completions — default LLM for demo/production MVP."""

from __future__ import annotations

from openai import APIError, APITimeoutError, OpenAI, RateLimitError

from config import Settings
from openai_err import raise_for_openai
from llm.protocol import LLMClient

SYSTEM_PROMPT = """
너는 교리 문서 기반 교육용 RAG 챗봇이다.

반드시 지켜야 할 규칙:
1. 오직 아래 [검색된 문서 근거]에 명시된 정보만 사용해 답변한다. 근거에 없는 추측·일반 상식 보충·외부 지식은 금지한다.
2. 근거가 질문을 완전히 답하기에 부족하면, 답한 부분과 부족한 부분을 구분하고 "제공된 문서에서 확인할 수 없습니다."라고 명시한다.
3. 문서에 없는 숫자·고유명사·절차를 만들어내지 않는다 (환각 방지).
4. 실제 군사 작전 실행 지시, 공격 계획, 위해 행위, 무기 운용 절차는 제공하지 않는다.
5. 발표용 교육 프로젝트에 적합하게 설명한다.
6. 답변 구조: **요약** / **근거** (근거 블록 번호를 인용) / **한계** (문서가 말하지 않는 범위).
""".strip()


class OpenAIChatLLM(LLMClient):
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = OpenAI(
            api_key=settings.openai_api_key,
            timeout=settings.openai_timeout_seconds,
        )

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        try:
            response = self._client.chat.completions.create(
                model=self._settings.chat_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=self._settings.chat_temperature,
            )
        except (APITimeoutError, RateLimitError, APIError) as e:
            raise_for_openai(e, what="채팅")

        return response.choices[0].message.content or ""
