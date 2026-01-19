<template>

  <IonPage>
    <IonHeader :translucent="true">
      <IonToolbar>
        <IonTitle>FiscusApp</IonTitle>
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
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonList, IonItem, IonLabel, IonNote,
  IonFab, IonFabButton, IonIcon,
  modalController, alertController, // <--- Importamos alertController
  IonItemSliding, IonItemOptions, IonItemOption // <--- Importamos componentes de Deslizar
} from '@ionic/vue';
import { add, trash } from 'ionicons/icons'; // <--- Importamos el icono de basura
import ExpenseService from '@/services/ExpenseService';
import AddExpenseModal from '@/components/AddExpenseModal.vue';

// Diccionario de traducciones (Igual que antes)
const traducciones: Record<string, string> = {
  'fixed': 'Fijo', 'variable': 'Variable', 'ant': 'Gasto Hormiga',
  'one_time': 'Una vez', 'bi_weekly': 'Quincenal', 'monthly': 'Mensual', 'yearly': 'Anual'
};
const formatearFecha = (fecha: string) => {
  if (!fecha) return '';
  
  // 1. TRUCO: Cortamos el string donde haya una 'T' o un espacio
  // Así convertimos "2026-01-09T14:00:00.000Z" -> "2026-01-09"
  const fechaLimpia = fecha.split('T')[0].split(' ')[0];

  // 2. Ahora sí le pegamos la hora 00:00 para evitar problemas de zona horaria
  const date = new Date(fechaLimpia + 'T00:00:00'); 

  // 3. Validación de seguridad
  if (isNaN(date.getTime())) return '---';

  // 4. Formato bonito (ej. 09 ene)
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
      expense: expenseToEdit // Le pasamos el gasto al modal
    }
  });

  modal.onDidDismiss().then((data) => {
    if (data.role === 'confirm') {
      loadExpenses(); // Recargamos la lista al cerrar
    }
  });

  return modal.present();
};


// --- NUEVA FUNCIÓN: CONFIRMAR Y BORRAR ---
const confirmDelete = async (id: number) => {
  const alert = await alertController.create({
    header: '¿Estás seguro?',
    message: 'Esta acción no se puede deshacer.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive', // Esto lo pone rojo en iOS
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
    // Truco visual: Lo quitamos de la lista localmente para no tener que recargar todo
    expenses.value = expenses.value.filter(e => e.id !== id);
  } catch (error) {
    console.error("Error borrando:", error);
    alert("No se pudo borrar");
  }
};

onMounted(() => { loadExpenses(); });
</script>
