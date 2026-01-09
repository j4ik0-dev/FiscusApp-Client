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
        <IonItem v-for="expense in expenses" :key="expense.id">
          <IonLabel>
            <h2>{{ expense.title }}</h2>
            <p>{{ traducir(expense.frequency) }} · {{ traducir(expense.type) }}</p>
          </IonLabel>
          <IonNote slot="end" color="success" style="font-weight: bold; font-size: 1.1em;">
            ${{ expense.amount }}
          </IonNote>
        </IonItem>
      </IonList>

      <div v-if="expenses.length === 0" style="text-align: center; margin-top: 50px; color: gray;">
        <p>No hay gastos registrados aún.</p>
      </div>

      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton @click="openModal">
          <IonIcon :icon="add"></IonIcon>
        </IonFabButton>
      </IonFab>

    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonNote, IonFab, IonFabButton, IonIcon, modalController } from '@ionic/vue';
import { add } from 'ionicons/icons'; // Icono de suma
import ExpenseService from '@/services/ExpenseService';
import AddExpenseModal from '@/components/AddExpenseModal.vue'; // Importamos el modal
// Diccionario de traducciones
const traducciones: Record<string, string> = {
  // Tipos
  'fixed': 'Fijo',
  'variable': 'Variable',
  'ant': 'Gasto Hormiga',
  // Frecuencias
  'one_time': 'Una vez',
  'bi_weekly': 'Quincenal',
  'monthly': 'Mensual',
  'yearly': 'Anual'
};

// Función simple para usar en el HTML
const traducir = (texto: string) => {
  return traducciones[texto] || texto; // Si no encuentra traducción, devuelve el original
};
const expenses = ref<any[]>([]);

// Función para cargar gastos (la usaremos al iniciar y al guardar uno nuevo)
const loadExpenses = async () => {
  try {
    const response = await ExpenseService.getExpenses();
    expenses.value = response.data;
  } catch (error) {
    console.error("Error cargando gastos:", error);
  }
};

// Función para ABRIR el Modal
const openModal = async () => {
  const modal = await modalController.create({
    component: AddExpenseModal,
  });

  // Cuando el modal se cierre, verificamos si se guardó algo
  modal.onDidDismiss().then((data) => {
    if (data.role === 'confirm') {
      // Si se guardó, recargamos la lista para ver el nuevo gasto
      loadExpenses();
    }
  });

  return modal.present();
};

onMounted(() => {
  loadExpenses();
});
</script>
<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
