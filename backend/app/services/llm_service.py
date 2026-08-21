import os

from openai import OpenAI


class LLMService:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "mock")
        self.api_key = os.getenv("OPENAI_API_KEY")

        self.client = None

        if self.provider == "openai" and self.api_key:
            self.client = OpenAI(
                api_key=self.api_key
            )

    def generate_answer(
        self,
        question: str,
        context: str,
    ) -> str:

        if self.provider == "mock":
            return self._mock_response(
                question=question,
                context=context,
            )

        if self.provider != "openai":
            return (
                f"Unsupported LLM provider: "
                f"{self.provider}"
            )

        if not self.api_key:
            return (
                "OpenAI integration is enabled, "
                "but OPENAI_API_KEY is not configured."
            )

        if not self.client:
            return (
                "OpenAI client could not be initialized."
            )

        try:
            response = self.client.responses.create(
                model="gpt-5-mini",
                instructions=(
                    "You are StoragePilot AI, an enterprise "
                    "NetApp ONTAP storage operations assistant. "
                    "Answer only from the storage context supplied. "
                    "Do not invent clusters, volumes, alerts, "
                    "performance values, commands, or configurations. "
                    "If the context does not contain enough information, "
                    "say that clearly. "
                    "Prioritize operational safety. "
                    "When recommending a change, explain the reason "
                    "before suggesting an action. "
                    "Never claim that a storage change was executed."
                ),
                input=(
                    "CURRENT STORAGE CONTEXT:\n"
                    f"{context}\n\n"
                    "USER QUESTION:\n"
                    f"{question}"
                ),
            )

            answer = response.output_text

            if not answer:
                return (
                    "The AI model returned an empty response."
                )

            return answer

        except Exception as error:
            return (
                "StoragePilot could not complete the AI analysis. "
                f"Error: {str(error)}"
            )

    def _mock_response(
        self,
        question: str,
        context: str,
    ) -> str:
        return (
            "StoragePilot AI is currently running in "
            "local development mode. "
            f"Question received: {question}. "
            "Storage inventory context was successfully "
            "collected and is ready for AI analysis."
        )