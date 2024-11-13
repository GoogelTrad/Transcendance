from django import forms
from .models import Users

class RegisterForm(forms.ModelForm):
    password_confirm = forms.CharField(
        widget=forms.PasswordInput,
        label="Confirm Password"
    )
    
    class Meta:
        model = Users
        fields = ['pseudo', 'mail', 'password', 'pp']
        widgets = {
            'password': forms.PasswordInput(),
        }

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get("password_confirm")

        if password and password_confirm and password != password_confirm:
            self.add_error('password_confirm', "Passwords do not match.")
        
        return cleaned_data
