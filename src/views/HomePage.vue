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
            <p>{{ expense.frequency }} · {{ expense.type }}</p>
          </IonLabel>
          
          <IonNote slot="end" color="success" style="font-weight: bold; font-size: 1.1em;">
            ${{ expense.amount }}
          </IonNote>
        </IonItem>
      </IonList>

      <div v-if="expenses.length === 0" style="text-align: center; margin-top: 50px; color: gray;">
        <p>No hay gastos registrados aún.</p>
      </div>

    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonBadge,IonNote } from '@ionic/vue';
import ExpenseService from '@/services/ExpenseService';

// 1. Variable reactiva para guardar la lista de gastos
const expenses = ref<any[]>([]);

onMounted(async () => {
  try {
    const response = await ExpenseService.getExpenses();
    // 2. Asignamos los datos que vienen de Laravel a nuestra variable
    expenses.value = response.data;
  } catch (error) {
    console.error("Error cargando gastos:", error);
  }
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
