from django.contrib.auth.password_validation import MinimumLengthValidator

class CustomMinimumLengthValidator(MinimumLengthValidator):
    def __init__(self):
        super().__init__()
        self.min_length = 4
