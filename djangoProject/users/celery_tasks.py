from celery import shared_task
import logging
from django.contrib.auth import get_user_model
from .algorithm import PairingAlgorithm
from django.db.models import Q
from .models import PairsModel

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    acks_late=True,
    reject_on_worker_lost=True
)
def make_pairs(self):
    users = get_user_model().objects.filter(is_active_pair=True)
    # history = PairsModel.objects.filter(is_archived=True)
    history = PairsModel.objects.all()
    history.update(is_archived=True)


    pairing_algorithm = PairingAlgorithm(users, history)

    pairs, excluded_user = pairing_algorithm.find_pairs()

    if excluded_user:
        pair_with_excluded_user = PairsModel(
            user1=excluded_user,
            user2=get_user_model().objects.get(username="admin")
        )
        pair_with_excluded_user.save()

    logger.info(f"Найдено пар: {len(pairs)}")
    if excluded_user:
        logger.info(f"Исключен: {excluded_user.username}")

    pairs_with_hobbies = 0
    for i, (user1, user2, has_common_hobbies) in enumerate(pairs, 1):
        if has_common_hobbies:
            common_hobbies = user1.get_common_hobbies(user2)

            pair = PairsModel.objects.filter((Q(user1=user1) | Q(user2=user1))
                                             & (Q(user1=user2) | Q(user2=user2)))[0]

            pair.common_hobbies.set(common_hobbies)

        hobby_status = "✓" if has_common_hobbies else "✗"

        logger.info(f"  Пара {i}: {user1.username} - {user2.username} {hobby_status}")
        if has_common_hobbies:
            logger.info(f"    Общие хобби: {[str(hobby) for hobby in common_hobbies]}")
            pairs_with_hobbies += 1
        else:
            logger.info(f"    Общих хобби нет")

    success_rate = (pairs_with_hobbies / len(pairs)) * 100 if pairs else 0
    logger.info(f"  Процент пар с общими хобби: {success_rate:.1f}%")

    return 1
