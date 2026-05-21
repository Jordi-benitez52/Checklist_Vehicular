from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('platform_core', '0010_remove_propietario_add_empresa_choices'),
    ]

    operations = [
        migrations.AddField(
            model_name='checklisttractoitemcatalogo',
            name='tipo_respuesta',
            field=models.CharField(
                choices=[('binario', 'OK / Falla / N/A'), ('nivel', 'Nivel (Max/Mitad/Bajo/Muy bajo)'), ('booleano', 'Bueno / Malo')],
                default='binario',
                max_length=20
            ),
        ),
    ]
