<template>
  <IonPage>
    <IonHeader :translucent="true">
      <IonToolbar>
        <IonTitle>FiscusApp</IonTitle>
        <IonButtons slot="end">
          <IonButton router-link="/perfil">
            <IonIcon slot="icon-only" :icon="personCircleOutline"></IonIcon>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent :fullscreen="true" class="ion-padding">
      <IonHeader collapse="condense">
        <IonToolbar>
          <IonTitle size="large">Mis Gastos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonList :inset="true">
        <IonItemSliding v-for="expense in expenses" :key="expense.id">
          <IonItem button @click="openModal(expense)">
            <IonLabel>
              <h2>{{ expense.title }}</h2>
              <p>{{ formatearFecha(expense.payment_date) }} · {{ traducir(expense.frequency) }} · {{
                traducir(expense.type) }}</p>
            </IonLabel>
            <IonNote slot="end" color="success" style="font-weight: bold; font-size: 1.1em;">
              ${{ expense.amount }}
            </IonNote>
          </IonItem>

          <IonItemOptions side="end">
            <IonItemOption color="danger" @click="confirmDelete(expense.id)">
              <IonIcon slot="icon-only" :icon="trash"></IonIcon>
            </IonItemOption>
          </IonItemOptions>

        </IonItemSliding>
      </IonList>
      <div v-if="expenses.length === 0" style="text-align: center; margin-top: 50px; color: gray;">
        <p>No hay gastos registrados aún.</p>
      </div>
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton @click="openModal()">
          <IonIcon :icon="add"></IonIcon>
        </IonFabButton>
      </IonFab>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonNote,  IonFab, IonFabButton, IonIcon,  modalController, alertController,  IonItemSliding, IonItemOptions, IonItemOption, IonButtons, IonButton } from '@ionic/vue';
import { add, trash, personCircleOutline } from 'ionicons/icons'; // <--- Importamos el icono de basura
import ExpenseService from '@/services/ExpenseService';
import AddExpenseModal from '@/components/AddExpenseModal.vue';
const traducciones: Record<string, string> = {
  'fixed': 'Fijo', 'variable': 'Variable', 'ant': 'Gasto Hormiga',
  'one_time': 'Una vez', 'bi_weekly': 'Quincenal', 'monthly': 'Mensual', 'yearly': 'Anual'
};
const formatearFecha = (fecha: string) => {
  if (!fecha) return '';
  const fechaLimpia = fecha.split('T')[0].split(' ')[0];
  const date = new Date(fechaLimpia + 'T00:00:00');
  if (isNaN(date.getTime())) return '---';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
  }).format(date);
};
const traducir = (texto: string) => traducciones[texto] || texto;
const expenses = ref<any[]>([]);
const loadExpenses = async () => {
  try {
    const response = await ExpenseService.getExpenses();
    expenses.value = response.data;
  } catch (error) {
    console.error("Error cargando gastos:", error);
  }
};
const openModal = async (expenseToEdit = null) => {
  const modal = await modalController.create({
    component: AddExpenseModal,
    componentProps: {
      expense: expenseToEdit
    }
  });

  modal.onDidDismiss().then((data) => {
    if (data.role === 'confirm') {
      loadExpenses(); 
    }
  });

  return modal.present();
};


const confirmDelete = async (id: number) => {
  const alert = await alertController.create({
    header: '¿Estás seguro?',
    message: 'Esta acción no se puede deshacer.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          await deleteExpense(id);
        },
      },
    ],
  });
  await alert.present();
};

// Función que llama a la API
const deleteExpense = async (id: number) => {
  try {
    await ExpenseService.deleteExpense(id);
    expenses.value = expenses.value.filter(e => e.id !== id);
  } catch (error) {
    console.error("Error borrando:", error);
    alert("No se pudo borrar");
  }
};

onMounted(() => { loadExpenses(); });
</script>
