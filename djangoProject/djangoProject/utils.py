def str_to_bool(value: str) -> bool:
    return value.strip().lower() in ("1", "true", "yes", "on")