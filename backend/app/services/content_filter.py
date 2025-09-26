import re

class ContentFilter:
    FORBIDDEN_WORDS = [
        'merda', 'bosta', 'caralho', 'porra', 'cu', 'buceta', 'piroca',
        'fdp', 'pqp', 'vsf', 'krl', 'puta', 'vagabundo', 'viado'
    ]

    SPAM_PATTERNS = [
        r'https?://[^\s]+',
        r'www\.[^\s]+',
        r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
        r'(\d{4,5}[-.\s]?\d{4,5})',
        r'(whatsapp|telegram|instagram|facebook)',
        r'(compre|venda|promoção|desconto|clique aqui)',
    ]

    @staticmethod
    def is_content_safe(text: str) -> tuple[bool, str]:
        if not text or len(text.strip()) == 0:
            return False, "Comentário vazio"

        lower = text.lower()

        for w in ContentFilter.FORBIDDEN_WORDS:
            if w in lower:
                return False, "Linguagem inadequada detectada"

        for p in ContentFilter.SPAM_PATTERNS:
            if re.search(p, text, re.IGNORECASE):
                return False, "Conteúdo suspeito de spam ou links não permitidos"

        words = lower.split()
        if words and len(set(words)) < len(words) * 0.5:
            return False, "Conteúdo repetitivo detectado"

        if len(text.strip()) < 3:
            return False, "Comentário muito curto"
        if len(text.strip()) > 1000:
            return False, "Comentário muito longo (máx. 1000)"

        return True, ""
