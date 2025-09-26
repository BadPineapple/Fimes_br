import time
from collections import defaultdict

_rate_store = defaultdict(list)

def check_rate_limit(client_ip: str, max_requests: int, window_seconds: int) -> bool:
    now = time.time()
    _rate_store[client_ip] = [t for t in _rate_store[client_ip] if now - t < window_seconds]
    if len(_rate_store[client_ip]) >= max_requests:
        return False
    _rate_store[client_ip].append(now)
    return True
