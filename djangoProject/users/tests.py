from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from .models import *
from rest_framework import status

class HobbyAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        response = self.client.post(
            "/api/register/",
            {
                "email": "test@test.com",
                "password": "1234qwertyabcde",
            },
            format="json",
        )

        self.access_token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

        # self.hobby = HobbyModel.objects.create(name="Хобби 1")
        # self.hobby2 = HobbyModel.objects.create(name="Хобби 2")


    def test_user_can_add_or_get_hobbies(self):
        # Добавить пользователю хобби (id=1, id=2)

        self.user.hobby.add(HobbyModel.objects.get(pk=1))

        response = self.client.get('/api/hobby/total/')
        all_tags = response.data["user_tags"]
        print(all_tags)



    def test_get_hobby_all(self):
        response = self.client.get("/api/hobby/all/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
