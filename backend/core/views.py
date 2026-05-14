from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from .forms import RegistroVehicularForm
from .models import RegistroVehicular
from accounts.models import UserProfile


@login_required
def registrar_movimiento(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role != 'guardia':
            return redirect('admin-dashboard')
    except UserProfile.DoesNotExist:
        return redirect('login')

    tipo_preseleccionado = request.GET.get('tipo')

    if request.method == 'POST':
        form = RegistroVehicularForm(request.POST)
        if form.is_valid():
            registro = form.save(commit=False)
            registro.registrado_por = request.user
            registro.save()
            return redirect('movimientos-recientes')
    else:
        initial_data = {}
        if tipo_preseleccionado in ['entrada', 'salida']:
            initial_data['tipo_movimiento'] = tipo_preseleccionado

        form = RegistroVehicularForm(initial=initial_data)

    context = {
        'form': form,
        'tipo_preseleccionado': tipo_preseleccionado,
    }

    return render(request, 'core/registrar_movimiento.html', context)


@login_required
def movimientos_recientes(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return redirect('login')

    if profile.role == 'guardia':
        registros = RegistroVehicular.objects.filter(registrado_por=request.user)[:20]
    else:
        registros = RegistroVehicular.objects.all()[:20]

    return render(request, 'core/movimientos_recientes.html', {'registros': registros})