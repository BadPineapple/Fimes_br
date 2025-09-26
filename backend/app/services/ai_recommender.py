import uuid
import logging
from typing import List, Tuple
from app.core.settings import settings

# Biblioteca do seu código original:
# emergentintegrations.llm.chat import LlmChat, UserMessage
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except Exception as e:
    LlmChat = None
    UserMessage = None
    logging.warning("Pacote emergentintegrations.llm.chat não disponível. IA ficará desativada.")

async def recommend_from_description(films: List[str], description: str) -> Tuple[List[str], str]:
    """
    Retorna (recomendações, explicação). Se a lib LLM não estiver disponível, faz um fallback simples.
    """
    if not LlmChat or not settings.EMERGENT_LLM_KEY:
        # Fallback: ranking tosco por palavras-chave
        desc_lower = description.lower()
        ranked = sorted(
            films,
            key=lambda t: -sum(1 for w in t.lower().split() if w in desc_lower)
        )
        recs = ranked[:5] if ranked else films[:5]
        return recs, "Recomendações geradas localmente usando correspondência simples de palavras (fallback)."

    try:
        chat = LlmChat(
            api_key=settings.EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message=(
                "Você é um especialista em cinema brasileiro. "
                "Baseado na descrição do usuário, recomende filmes brasileiros da nossa base.\n\n"
                f"Filmes disponíveis: {', '.join(films)}\n\n"
                "Responda APENAS com uma lista numerada (máx 5) seguida de uma breve explicação em PT-BR."
            ),
        ).with_model("openai", "gpt-4o")

        msg = UserMessage(text=f"Quero assistir algo assim: {description}")
        response = await chat.send_message(msg)

        lines = [ln.strip() for ln in response.strip().splitlines() if ln.strip()]
        recommendations, explanation_start = [], -1

        for i, line in enumerate(lines):
            if line[0].isdigit() or line.startswith("-"):
                parts = line.split(". ", 1) if ". " in line else line.split("- ", 1)
                if len(parts) > 1:
                    recommendations.append(parts[1].strip())
            elif recommendations and explanation_start == -1:
                explanation_start = i
                break

        explanation = "\n".join(lines[explanation_start:]) if explanation_start != -1 else \
            "Essas recomendações foram baseadas na sua descrição."
        return recommendations[:5], explanation.strip()

    except Exception as e:
        logging.error(f"AI recommendation error: {e}")
        return films[:5], "Ocorreu um erro na IA; retornando recomendações básicas."
