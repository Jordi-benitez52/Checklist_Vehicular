from django import forms
from .models import RegistroVehicular


class RegistroVehicularForm(forms.ModelForm):
    class Meta:
        model = RegistroVehicular
        fields = [
            'tipo_movimiento',
            'nombre_conductor',
            'placa',
            'vehiculo',
            'observaciones'
        ]
        widgets = {
            'tipo_movimiento': forms.Select(attrs={'class': 'form-control'}),
            'nombre_conductor': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre del conductor'
            }),
            'placa': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Placa del vehículo'
            }),
            'vehiculo': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo o modelo del vehículo'
            }),
            'observaciones': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Observaciones',
                'rows': 4
            }),
        }