# utils.py
import hmac
import hashlib

def check_telegram_auth(data: dict, bot_token: str) -> bool:
    data = data.copy()
    print(data)

    email = data.pop('email', None)

    if isinstance(data.get("hash"), list):
        check_hash = data.pop('hash')[0]

    check_hash = data.pop('hash')
    print(f'check_hash: {check_hash}')
    sorted_data = sorted([f"{k}={v}" for k, v in data.items()])

    # username, id, first_name, auth_date
    data_string = '\n'.join(sorted_data)
    print('TG data:', data_string)

    # Возвращаются "сырые" данные в бинарном виде.
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    hmac_hash = hmac.new(secret_key, data_string.encode(), hashlib.sha256).hexdigest()
    print(f'Eq: {hmac_hash == check_hash}')
    return hmac_hash == check_hash
