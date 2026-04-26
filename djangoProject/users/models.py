from django.contrib.auth.models import AbstractUser
from django.db import models


class PairsModel(models.Model):
    created_at = models.DateField(auto_now_add=True)
    user1 = models.ForeignKey("CustomUser", on_delete=models.CASCADE, related_name="user1")
    user2 = models.ForeignKey("CustomUser", on_delete=models.CASCADE, related_name="user2")
    is_archived = models.BooleanField(null=True, blank=True, default=False)  # Если True - пара уже была
    common_hobbies = models.ManyToManyField("HobbyModel", verbose_name="Общие хобби", blank=True)

    def __str__(self):
        return f'{self.user1.email} - {self.user2.email}'

    def __repr__(self):
        return f'{self.user1.email} - {self.user2.email}'


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    birth = models.DateField(verbose_name="Дата рождения", null=True, blank=True)
    chat_id = models.CharField(max_length=50, null=True, blank=True)
    image = models.ImageField(upload_to="users/", null=True, blank=True)
    hobby = models.ManyToManyField("HobbyModel", verbose_name="Хобби", blank=True)
    tg_link = models.CharField(max_length=255, null=True, blank=True)
    is_active_pair = models.BooleanField(default=True)
    yandex_oauth = models.BooleanField(default=False)
    tg_auth = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'  # email как уникальный идентификатор пользователя при логине.
    REQUIRED_FIELDS = ['username']  # Поля, которые обязательны при создании суперпользователя.

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

    def has_common_hobby(self, other_user):
        """Проверяет наличие общих хобби с другим пользователем"""
        # Создаем множества из hobby_id для быстрого поиска пересечений
        self_hobby_ids = {hobby.pk for hobby in self.hobby.all()}
        other_hobby_ids = {hobby.pk for hobby in other_user.hobby.all()}
        return bool(self_hobby_ids & other_hobby_ids)

    def get_common_hobbies(self, other_user):
        """Возвращает список общих хобби с другим пользователем"""
        # Создаем словарь hobby_id -> hobby для быстрого доступа
        other_hobbies_dict = {hobby.pk: hobby for hobby in other_user.hobby.all()}

        common = []
        for hobby in self.hobby.all():
            if hobby.pk in other_hobbies_dict:
                common.append(hobby)
        return common


class HobbyModel(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    class Meta:
        verbose_name = "Хобби"
        verbose_name_plural = "Хобби"
