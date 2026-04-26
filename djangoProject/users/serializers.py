from django.contrib.auth import get_user_model
from rest_framework import serializers, status
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    default_error_messages = {"no_active_account": "Неверный email или пароль"}


class UserSerializer(serializers.ModelSerializer):
    birth = serializers.DateField(
        required=False,
    )

    hobby = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
        write_only=True
    )

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "birth",
            "chat_id",
            "image",
            "hobby",
            "password",
            "tg_link",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_password(self, password):
        try:
            validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return password

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["hobby"] = HobbySerializer(instance.hobby.all(), many=True).data
        return data

    def create(self, validated_data):
        validated_data["username"] = validated_data["email"]
        password = validated_data.pop("password")

        user = super().create(validated_data)
        user.set_password(password)
        user.save()

        return user

    def update(self, instance, validated_data):
        hobby_ids = validated_data.pop("hobby", None)
        instance = super().update(instance, validated_data)
        print('hobby_ids:', hobby_ids)

        if hobby_ids is not None:
            hobbies = HobbyModel.objects.filter(pk__in=hobby_ids)
            instance.hobby.set(hobbies)
            instance.save()

        return instance


class PairsSerializer(serializers.ModelSerializer):
    partner = serializers.SerializerMethodField()

    def get_partner(self, obj):
        partner = None
        current_user = self.context["request"].user

        if obj.user1 and obj.user1 != current_user:
            partner = obj.user1
        if obj.user2 and obj.user2 != current_user:
            partner = obj.user2
        # if obj.user3 and obj.user3 != current_user:
        #     partner = obj.user3

        partner_data = {
            "id": partner.id,
            "first_name": partner.first_name,
            "last_name": partner.last_name,
            "email": partner.email,
            "tg_link": partner.tg_link,
            "hobby": HobbySerializer(partner.hobby.all(), many=True).data,
        }

        return partner_data

    class Meta:
        model = PairsModel
        fields = ["id", "partner", "created_at"]


class HobbySerializer(serializers.ModelSerializer):
    class Meta:
        model = HobbyModel
        fields = "__all__"


class HobbyUpdateSerializer(serializers.Serializer):
    hobby = serializers.ListField(child=serializers.IntegerField(), required=True)
