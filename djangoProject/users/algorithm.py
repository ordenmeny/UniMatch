from collections import defaultdict

from django.contrib.auth import get_user_model

from .models import PairsModel


class PairingAlgorithm:
    def __init__(self, users, history):
        self.users = users
        self.history = history
        self.user_pair_count = defaultdict(int)  # Счетчик пар для каждого пользователя

    def has_paired_before(self, user1, user2):
        """Проверяет, была ли пара ранее"""
        for record in self.history:
            if (record.user1 == user1 and record.user2 == user2) or (
                record.user1 == user2 and record.user2 == user1
            ):
                return True
        return False

    def get_compatibility_score(self, user1, user2):
        """Вычисляет совместимость пары (количество общих хобби)"""
        if not user1.has_common_hobby(user2):
            return 0
        return len(user1.get_common_hobbies(user2))

    def get_balance_score(self, user1, user2):
        """Вычисляет балансировочный счет (меньше = лучше для балансировки)"""
        return (
            self.user_pair_count[user1.username] + self.user_pair_count[user2.username]
        )

    def find_pairs(self):
        """Основной алгоритм поиска пар"""
        available_users = self.users.all()
        pairs = []

        # Если нечетное количество пользователей, выбираем кого исключить
        excluded_user = None
        if len(available_users) % 2 == 1:
            excluded_user = self._select_user_to_exclude(available_users)
            # available_users.remove(excluded_user)
            available_users = self.users.all().exclude(pk=excluded_user.pk)
            # print(f"Пользователь {excluded_user.username} исключен из этой итерации (нечетное количество)")

        # Фаза 1: Создаем пары с общими хобби
        pairs, used_users = self._create_pairs_with_common_hobbies(available_users)

        # Фаза 2: Создаем оставшиеся пары без учета общих хобби
        remaining_users = [user for user in available_users if user.username not in used_users]
        remaining_pairs = self._create_remaining_pairs(remaining_users)

        pairs.extend(remaining_pairs)

        return pairs, excluded_user

    def _select_user_to_exclude(self, users):
        """Выбирает пользователя для исключения (с наибольшим количеством пар)"""
        # Сортируем по количеству пар (по убыванию) и берем первого
        users_sorted = sorted(users, key=lambda u: self.user_pair_count[u.username], reverse=True)
        return users_sorted[0]

    def _create_pairs_with_common_hobbies(self, available_users):
        """Создает пары с общими хобби"""
        potential_pairs = []

        for i in range(len(available_users)):
            for j in range(i + 1, len(available_users)):
                user1, user2 = available_users[i], available_users[j]

                # Проверяем наличие общих хобби
                if not user1.has_common_hobby(user2):
                    continue

                # Проверяем, не была ли пара ранее
                if self.has_paired_before(user1, user2):
                    continue

                compatibility = self.get_compatibility_score(user1, user2)
                balance_score = self.get_balance_score(user1, user2)

                potential_pairs.append({
                    "users": (user1, user2),
                    "compatibility": compatibility,
                    "balance_score": balance_score,
                    "common_hobbies": user1.get_common_hobbies(user2),
                })

        # Сортируем пары по критериям
        potential_pairs.sort(key=lambda x: (x["balance_score"], -x["compatibility"]))

        # Выбираем пары жадным алгоритмом
        pairs = []
        used_users = set()

        for pair_info in potential_pairs:
            user1, user2 = pair_info["users"]

            if user1.username not in used_users and user2.username not in used_users:
                pairs.append((user1, user2, True))  # True означает наличие общих хобби
                used_users.add(user1.username)
                used_users.add(user2.username)

                self._record_pair(user1, user2)

        return pairs, used_users

    def _create_remaining_pairs(self, remaining_users):
        """Создает пары из оставшихся пользователей без учета общих хобби"""
        pairs = []

        # Создаем все возможные пары из оставшихся пользователей
        potential_pairs = []

        for i in range(len(remaining_users)):
            for j in range(i + 1, len(remaining_users)):
                user1, user2 = remaining_users[i], remaining_users[j]

                # Проверяем, не была ли пара ранее
                if self.has_paired_before(user1, user2):
                    continue

                balance_score = self.get_balance_score(user1, user2)
                compatibility = self.get_compatibility_score(user1, user2)

                potential_pairs.append({
                    "users": (user1, user2),
                    "balance_score": balance_score,
                    "compatibility": compatibility,
                })

        # Сортируем по балансу, затем по совместимости
        potential_pairs.sort(key=lambda x: (x["balance_score"], -x["compatibility"]))

        used_users = set()

        for pair_info in potential_pairs:
            user1, user2 = pair_info["users"]

            if user1.username not in used_users and user2.username not in used_users:
                has_common = user1.has_common_hobby(user2)
                pairs.append((user1, user2, has_common))
                used_users.add(user1.username)
                used_users.add(user2.username)

                self._record_pair(user1, user2)

        # Если остались непарные пользователи, создаем пары принудительно
        remaining_unpaired = [user for user in remaining_users if user.username not in used_users]

        while len(remaining_unpaired) >= 2:
            user1 = remaining_unpaired.pop(0)
            user2 = remaining_unpaired.pop(0)

            has_common = user1.has_common_hobby(user2)
            pairs.append((user1, user2, has_common))

            self._record_pair(user1, user2)

        return pairs

    def _record_pair(self, user1, user2):
        """Записывает пару в историю и обновляет счетчики"""
        self.user_pair_count[user1.username] += 1
        self.user_pair_count[user2.username] += 1

        history_id = len(self.history) + 1

        # self.history.append(History(history_id, user1.username, user2.username))

        new_pair = PairsModel(
            user1=user1,
            user2=user2,
            is_archived=False
        )
        new_pair.save()


    def get_statistics(self):
        """Возвращает статистику по парам пользователей"""
        stats = {
            "total_pairs": len(self.history),
            "user_pair_distribution": dict(self.user_pair_count),
            "users_never_paired": [],
        }

        for user in self.users:
            if self.user_pair_count[user.username] == 0:
                stats["users_never_paired"].append(user.username)

        return stats

