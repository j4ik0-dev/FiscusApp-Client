<template>
    <IonPage>
        <IonContent class="ion-padding ion-text-center">
            <h1 style="margin-top: 100px; margin-bottom: 50px;">FiscusApp</h1>
            <IonItem>
                <IonInput v-model="form.email" label="Correo" label-placement="floating" type="email"></IonInput>
            </IonItem>
            <IonItem>
                <IonInput v-model="form.password" label="Contraseña" label-placement="floating" type="password">
                </IonInput>
            </IonItem>
            <div style="margin-top: 30px;">
                <IonButton expand="block" @click="login">Iniciar Sesión</IonButton>
            </div>
            <p style="margin-top: 20px;">
                ¿No tienes cuenta?
                <RouterLink to="/register">Regístrate aquí</RouterLink>
            </p>
        </IonContent>
    </IonPage>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {IonPage, IonContent, IonInput, IonItem, IonButton, IonLabel,IonText, alertController} from '@ionic/vue';
import AuthService from '@/services/AuthService';

const router = useRouter();
const form = ref({ email: '', password: '' });

const login = async () => {
    try {
        await AuthService.login(form.value);
        // Si sale bien, nos vamos al Home
        router.push('/home');
    } catch (error: any) {
        const alerta = await alertController.create({
            header: 'Error',
            message: 'Credenciales incorrectas',
            buttons: ['OK']
        });
        await alerta.present();
    }
};
</script>