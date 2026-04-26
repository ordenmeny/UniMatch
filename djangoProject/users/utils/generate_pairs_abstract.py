from itertools import combinations
from typing import List, Union, Tuple, Set, FrozenSet

def generate_weekly_pairs(users: List, past_pairs: Set[FrozenSet]) -> List[Union[Tuple, Tuple[object, object, object]]]:
    """
    users: список объектов, у каждого есть метод .tags(), возвращающий список интересов
    past_pairs: множество frozenset-пар пользователей, которые уже были в паре ранее
    Возвращает список пар и, при необходимости, одну тройку
    """
    result_pairs = []
    users_copy = users.copy()
    user_tags = {user: set(user.tags()) for user in users_copy}  # кэшируем интересы
    used_users = set()

    print(f"\n[LOG] Начало распределения: {len(users_copy)} пользователей")

    # --- Шаг 1: формируем тройку, если нечётное количество ---
    reserved_trio = None
    if len(users_copy) % 2 == 1:
        print("[LOG] Нечётное количество — подбираем тройку...")
        best_trio = None
        best_score = -1

        for trio in combinations(users_copy, 3):
            a, b, c = trio
            t1, t2, t3 = user_tags[a], user_tags[b], user_tags[c]

            # Jaccard между каждой парой внутри тройки
            score = (
                len(t1 & t2) / len(t1 | t2) if t1 | t2 else 0 +
                len(t2 & t3) / len(t2 | t3) if t2 | t3 else 0 +
                len(t1 & t3) / len(t1 | t3) if t1 | t3 else 0
            )

            if score > best_score:
                best_score = score
                best_trio = trio

        if best_trio:
            reserved_trio = best_trio
            print(f"[LOG] Зарезервирована тройка: {best_trio}, общий Jaccard: {round(best_score, 3)}")
            for u in best_trio:
                users_copy.remove(u)

    # --- Шаг 2: формируем пары по интересам, исключая те, что были ---
    similarity_scores = []
    for user1, user2 in combinations(users_copy, 2):
        pair_key = frozenset([user1, user2])
        if pair_key in past_pairs:
            continue
        tags1 = user_tags[user1]
        tags2 = user_tags[user2]
        union = tags1 | tags2
        score = len(tags1 & tags2) / len(union) if union else 0
        similarity_scores.append((score, user1, user2))

    similarity_scores.sort(reverse=True, key=lambda x: x[0])

    for score, user1, user2 in similarity_scores:
        if user1 not in used_users and user2 not in used_users:
            result_pairs.append((user1, user2))
            used_users.update([user1, user2])
            past_pairs.add(frozenset([user1, user2]))
            print(f"[LOG] Сформирована пара: ({user1}, {user2}) — Jaccard: {round(score, 3)}")

    # --- Шаг 3: принудительное объединение оставшихся, с учётом истории ---
    remaining_users = [u for u in users_copy if u not in used_users]
    print(f"[LOG] Осталось нераспределённых: {len(remaining_users)}")

    while len(remaining_users) >= 2:
        found = False
        for i in range(len(remaining_users)):
            u1 = remaining_users[i]
            for j in range(i + 1, len(remaining_users)):
                u2 = remaining_users[j]
                if frozenset([u1, u2]) not in past_pairs:
                    result_pairs.append((u1, u2))
                    used_users.update([u1, u2])
                    past_pairs.add(frozenset([u1, u2]))
                    print(f"[LOG] Принудительно сформирована пара: ({u1}, {u2}) — нет общих интересов, но новая пара")
                    # Удаляем из remaining_users вручную
                    remaining_users.pop(j)
                    remaining_users.pop(i)
                    found = True
                    break
            if found:
                break
        if not found:
            print("[WARN] Не удалось найти новую пару среди оставшихся без повторов.")
            break

    # --- Шаг 4: добавляем тройку, если она есть ---
    if reserved_trio:
        result_pairs.append(reserved_trio)
        print(f"[LOG] Добавлена тройка: {reserved_trio}")

    print(f"[LOG] Всего сформировано {len(result_pairs)} пар/троек\n")
    return result_pairs



# Пример заглушки пользователя
class User:
    def __init__(self, username, tags):
        self.username = username
        self._tags = tags

    def tags(self):
        return self._tags

    def __repr__(self):
        return self.username

# Пример пользователей
users = [
    User("Bob", ["python", "movies", "chess", "test"]),
    User("Joahnan", ["c++", "Java"]),
    User("David", ["python", "reading"]),
    User("Eve", ["cooking", "chess"]),
    User("John", ["c++", "c#"]),
    User("Charlie", ["music", "chess"]),
    User("Alice", ["python", "reading", "chess", "test"]),

]

# История прошлых пар (пусть Alice и Bob уже были в паре)
past_pairs = {frozenset([users[0], users[1]])}

# Получаем пары
pairs = generate_weekly_pairs(users, past_pairs)
for p in pairs:
    print(p)
