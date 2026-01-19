<template>
    <IonPage>
        <IonContent class="ion-padding ion-text-center">

            <h1 style="margin-top: 50px;">Crear Cuenta</h1>

            <IonItem>
                <IonInput v-model="form.name" label="Nombre" label-placement="floating"></IonInput>
            </IonItem>

            <IonItem>
                <IonInput v-model="form.email" label="Correo" label-placement="floating" type="email"></IonInput>
            </IonItem>

            <IonItem>
                <IonInput v-model="form.password" label="Contraseña" label-placement="floating" type="password">
                </IonInput>
            </IonItem>

            <div style="margin-top: 30px;">
                <IonButton expand="block" @click="register">Registrarse</IonButton>
                <IonButton fill="clear" expand="block" router-link="/login">Volver al Login</IonButton>
            </div>

        </IonContent>
    </IonPage>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {IonPage, IonContent, IonInput, IonItem, IonButton, alertController} from '@ionic/vue';
import AuthService from '@/services/AuthService';
const router = useRouter();
const form = ref({ name: '', email: '', password: '' });
const register = async () => {
    try {
        await AuthService.register(form.value);
        router.push('/home');
    } catch (error: any) {
        const alerta = await alertController.create({
            header: 'Error',
            message: 'No se pudo crear la cuenta. Revisa los datos.',
            buttons: ['OK']
        });
        await alerta.present();
    }
};
</script>