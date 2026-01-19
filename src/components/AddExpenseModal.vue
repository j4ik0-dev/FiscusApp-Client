<template>
    <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
                <IonButton color="medium" @click="cancel">Cancelar</IonButton>
            </IonButtons>
            <IonTitle>{{ props.expense ? 'Editar Gasto' : 'Nuevo Gasto' }}</IonTitle>
            <IonButtons slot="end">
                <IonButton :strong="true" @click="save">Guardar</IonButton>
            </IonButtons>
        </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
        <IonItem>
            <IonInput v-model="form.title" label="¿Qué compraste?" label-placement="floating" placeholder="Ej. Tacos"
                :error-text="errors.title" :class="{ 'ion-invalid': !!errors.title, 'ion-touched': !!errors.title }">
            </IonInput>
        </IonItem>
        <IonItem>
            <IonInput v-model="form.amount" type="number" label="Monto ($)" label-placement="floating"
                placeholder="0.00" :error-text="errors.amount"
                :class="{ 'ion-invalid': !!errors.amount, 'ion-touched': !!errors.amount }"></IonInput>
        </IonItem>
        <IonItem>
            <IonInput type="date" label="Fecha" label-placement="floating" v-model="form.payment_date"></IonInput>
        </IonItem>
        <IonItem>
            <IonSelect v-model="form.type" label="Tipo" label-placement="floating" placeholder="Seleccione una opción"
                error-text="Selecciona un tipo" :class="{ 'ion-invalid': errors.type, 'ion-touched': errors.type }">
                <IonSelectOption value="fixed">Fijo (Spotify, Casa)</IonSelectOption>
                <IonSelectOption value="variable">Variable (Comida, Salidas)</IonSelectOption>
                <IonSelectOption value="ant">Gasto Hormiga</IonSelectOption>
            </IonSelect>
        </IonItem>
        <IonItem>
            <IonSelect v-model="form.frequency" label="Frecuencia" label-placement="floating"
                placeholder="Seleccione una frecuencia" error-text="Selecciona una frecuencia"
                :class="{ 'ion-invalid': errors.frequency, 'ion-touched': errors.frequency }">
                <IonSelectOption value="one_time">Una vez</IonSelectOption>
                <IonSelectOption value="monthly">Mensual</IonSelectOption>
                <IonSelectOption value="bi_weekly">Quincenal</IonSelectOption>
                <IonSelectOption value="yearly">Anual</IonSelectOption>
            </IonSelect>
        </IonItem>
    </IonContent>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonInput, IonSelect, IonSelectOption,
    modalController, alertController
} from '@ionic/vue';
import ExpenseService from '@/services/ExpenseService';

const props = defineProps<{
    expense?: any;
}>();

const today = new Date().toISOString().split('T')[0];

const form = ref({
    title: '',
    amount: '',
    type: undefined,
    frequency: undefined,
    user_id: 1,
    payment_date: today
});

const errors = ref({
    title: '',
    amount: '',
    type: '',
    frequency: ''
});

onMounted(() => {
    if (props.expense) {
        form.value = {
            ...props.expense,
            amount: props.expense.amount.toString()
        };
    }
});

const cancel = () => modalController.dismiss(null, 'cancel');

const save = async () => {
    // 1. Reseteamos errores
    errors.value = { title: '', amount: '', type: '', frequency: '' };
    let hayError = false;

    // --- VALIDACIONES ---
    if (!form.value.title) {
        errors.value.title = "El nombre es obligatorio";
        hayError = true;
    } else if (/\d/.test(form.value.title)) {
        errors.value.title = "El título no puede llevar números";
        hayError = true;
    }

    if (!form.value.amount) {
        errors.value.amount = "El monto es obligatorio";
        hayError = true;
    } else if (Number(form.value.amount) < 0) {
        errors.value.amount = "Solo numeros mayores a 0";
        hayError = true;
    }

    if (!form.value.type) {
        errors.value.type = "Selecciona un tipo";
        hayError = true;
    }
    if (!form.value.frequency) {
        errors.value.frequency = "Selecciona una frecuencia";
        hayError = true;
    }

    if (hayError) return;

    // 2. GUARDAR O EDITAR (UN SOLO BLOQUE TRY/CATCH)
    try {
        if (props.expense) {
            // MODO EDICIÓN
            await ExpenseService.updateExpense(props.expense.id, form.value);
        } else {
            // MODO CREACIÓN
            await ExpenseService.createExpense(form.value);
        }

        // 3. MOSTRAR ALERTA DE ÉXITO
        const alerta = await alertController.create({
            header: props.expense ? '¡Actualizado!' : '¡Guardado!',
            message: props.expense
                ? 'El gasto se actualizó correctamente.'
                : 'Tu gasto se registró correctamente.',
            buttons: [
                {
                    text: 'OK',
                    handler: () => {
                        modalController.dismiss(null, 'confirm');
                    }
                }
            ],
        });

        await alerta.present();

    } catch (error: any) {
        // 4. MANEJO DE ERRORES
        console.error("Error guardando:", error);
        const alertaError = await alertController.create({
            header: 'Hubo un problema',
            message: error.response?.data?.message || "No se pudo conectar con el servidor",
            buttons: ['Entendido'],
        });

        await alertaError.present();
    }
};
</script>