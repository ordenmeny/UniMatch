from itertools import combinations
from collections import defaultdict
import heapq

def generate_weekly_pairs(all_users, past_pairs):
    # Собираем интересы всех пользователей
    user_hobbies = {user: set(h.name for h in user.hobby.all()) for user in all_users}

    available_users = set(all_users)
    result = []

    # Если количество пользователей нечётное — зарезервируем лучшую тройку
    reserved_trio = None
    if len(available_users) % 2 == 1:
        best_trio = None
        best_score = -1
        for trio in combinations(all_users, 3):
            trio_set = frozenset(trio)
            if trio_set in past_pairs:
                continue
            # Проверяем, есть ли у всех троих общие интересы попарно
            u1, u2, u3 = trio
            inter12 = user_hobbies[u1] & user_hobbies[u2]
            inter13 = user_hobbies[u1] & user_hobbies[u3]
            inter23 = user_hobbies[u2] & user_hobbies[u3]
            if inter12 and inter13 and inter23:
                score = len(inter12) + len(inter13) + len(inter23)
                if score > best_score:
                    best_score = score
                    best_trio = trio
        if best_trio:
            reserved_trio = best_trio
            for u in reserved_trio:
                available_users.remove(u)

    # Кэш схожести между пользователями (оставшимися)
    similarity_heap = []
    for user1, user2 in combinations(available_users, 2):
        if frozenset([user1, user2]) in past_pairs:
            continue
        common_tags = user_hobbies[user1] & user_hobbies[user2]
        if common_tags:
            heapq.heappush(similarity_heap, (-len(common_tags), user1.id, user2.id, user1, user2))

    # Формируем пары по максимальной схожести
    while similarity_heap and len(available_users) >= 2:
        _, _, _, u1, u2 = heapq.heappop(similarity_heap)
        if u1 in available_users and u2 in available_users:
            result.append((u1, u2))
            available_users.remove(u1)
            available_users.remove(u2)

    # Добавляем зарезервированную тройку, если она была найдена
    if reserved_trio:
        result.append(reserved_trio)


    # === ЭТАП 3: худший случай — остался 1 пользователь, тройка не найдена ===
    if reserved_trio is None and len(available_users) == 1:
        lonely_user = next(iter(available_users))

        # Пробуем собрать хоть какую-нибудь тройку (даже если она была раньше!)
        best_trio = None
        best_score = -1
        for user1, user2 in combinations([u for pair in result for u in pair], 2):
            trio = (lonely_user, user1, user2)
            u1, u2, u3 = trio
            inter12 = user_hobbies[u1] & user_hobbies[u2]
            inter13 = user_hobbies[u1] & user_hobbies[u3]
            inter23 = user_hobbies[u2] & user_hobbies[u3]
            if inter12 and inter13 and inter23:
                score = len(inter12) + len(inter13) + len(inter23)
                if score > best_score:
                    best_trio = trio
                    best_score = score

        if best_trio:
            # Удаляем юзеров из старых пар
            u1, u2, u3 = best_trio
            pairs_to_remove = []
            for idx, pair in enumerate(result):
                if u2 in pair or u3 in pair:
                    pairs_to_remove.append(idx)
            # Удаляем эти пары
            for idx in sorted(pairs_to_remove, reverse=True):
                del result[idx]
            result.append(best_trio)
        else:
            # Даже этого не удалось — просто оставим пользователя без пары
            print(f" Пользователь {lonely_user.id} остался без пары — невозможно подобрать даже повтор.")

    return result

