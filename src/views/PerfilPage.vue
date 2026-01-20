<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton default-href="/home" v-if="!isEditing"></IonBackButton>
                    <IonButton v-else color="medium" @click="cancelEditing">
                        Cancelar
                    </IonButton>
                </IonButtons>

                <IonTitle>Mi Perfil</IonTitle>

                <IonButtons slot="end">
                    <IonButton v-if="!isEditing" @click="startEditing">
                        <IonIcon slot="icon-only" :icon="createOutline"></IonIcon>
                    </IonButton>

                    <IonButton v-else @click="saveProfile" :strong="true" color="primary">
                        Guardar
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent class="ion-padding ion-text-center">

            <div v-if="isLoading" style="margin-top: 50px;">
                <p>Cargando información...</p>
            </div>

            <div v-else>
                <div style="margin-top: 20px; margin-bottom: 30px; position: relative; display: inline-block;"
                    :style="{ opacity: isEditing ? 1 : 0.8 }">
                    <IonAvatar
                        style="width: 120px; height: 120px; margin: 0 auto; border: 3px solid var(--ion-color-primary);">
                        <img :src="previewAvatar || currentUser.avatar_url || 'https://ionicframework.com/docs/img/demos/avatar.svg'"
                            style="object-fit: cover; width: 100%; height: 100%;" />
                    </IonAvatar>

                    <div v-if="isEditing" @click="triggerCamera" class="camera-btn">
                        <IonIcon :icon="camera"></IonIcon>
                    </div>

                    <input type="file" ref="fileInput" accept="image/*" hidden @change="onFileChange" />
                </div>

                <IonItem class="ion-margin-bottom" :class="{ 'item-readonly': !isEditing }">
                    <IonInput v-model="form.name" label="Nombre" label-placement="stacked" :readonly="!isEditing"
                        :clear-input="isEditing"></IonInput>
                </IonItem>

                <IonItem class="ion-margin-bottom" :class="{ 'item-readonly': !isEditing }">
                    <IonInput v-model="form.email" label="Correo" label-placement="stacked" :readonly="!isEditing"
                        :clear-input="isEditing"></IonInput>
                </IonItem>

                <div style="margin-top: 40px;" v-if="!isEditing">
                    <IonButton expand="block" color="danger" fill="outline" @click="logout">
                        <IonIcon slot="start" :icon="logOutOutline"></IonIcon>
                        Cerrar Sesión
                    </IonButton>
                </div>

                <p v-else style="color: gray; font-size: 0.9em; margin-top: 20px;">
                    Toca la foto para cambiarla
                </p>

            </div>

        </IonContent>
    </IonPage>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonItem, IonInput, IonButton, IonAvatar, IonIcon,
    alertController, loadingController, toastController
} from '@ionic/vue';
import { camera, logOutOutline, createOutline, closeOutline, checkmarkOutline } from 'ionicons/icons';
import AuthService from '@/services/AuthService';

const router = useRouter();
const fileInput = ref<HTMLElement | null>(null);

// --- ESTADOS ---
const isEditing = ref(false); // ¿Estamos editando?
const isLoading = ref(true);  // ¿Cargando datos?

// Datos "Oficiales" (Lo que está en la BD)
const currentUser = ref({
    name: '',
    email: '',
    avatar_url: null as string | null
});

// Datos del "Formulario" (Lo que estás escribiendo)
const form = ref({
    name: '',
    email: '',
});

// Archivo de foto seleccionado
const selectedFile = ref<File | null>(null);
const previewAvatar = ref<string | null>(null); // Para mostrar la foto nueva antes de guardar

// --- 1. CARGAR DATOS AL INICIAR ---
const loadUserData = async () => {
    isLoading.value = true;
    try {
        const response = await AuthService.getUser();

        // Aseguramos la estructura de datos (ajusta según tu backend)
        // A veces Laravel devuelve directo el objeto y otras veces dentro de 'data'
        const userData = response.data.user || response.data;
        const avatarUrl = response.data.avatar_url || userData.avatar_url;

        // Guardamos en la variable "Oficial"
        currentUser.value = {
            name: userData.name,
            email: userData.email,
            avatar_url: avatarUrl
        };

        // Preparamos el formulario con esos datos
        resetForm();

    } catch (error) {
        console.error("Error cargando perfil:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadUserData();
});

// --- 2. LOGICA DE EDICIÓN ---

// Activar modo edición
const startEditing = () => {
    isEditing.value = true;
};

// Cancelar edición (Revertir cambios)
const cancelEditing = () => {
    isEditing.value = false;
    selectedFile.value = null;
    previewAvatar.value = null;
    resetForm(); // Volvemos a poner los datos originales
};

// Copiar datos originales al formulario
const resetForm = () => {
    form.value.name = currentUser.value.name;
    form.value.email = currentUser.value.email;
};

// --- 3. LÓGICA DE FOTO ---
const triggerCamera = () => {
    if (!isEditing.value) return; // Solo funciona si estás editando
    fileInput.value?.click();
};

const onFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
        selectedFile.value = file;
        previewAvatar.value = URL.createObjectURL(file);
    }
};

// --- 4. GUARDAR CAMBIOS ---
const saveProfile = async () => {
    const loading = await loadingController.create({ message: 'Actualizando...' });
    await loading.present();

    try {
        const formData = new FormData();
        formData.append('name', form.value.name);
        formData.append('email', form.value.email);

        if (selectedFile.value) {
            formData.append('avatar', selectedFile.value);
        }

        // Enviamos al backend
        const response = await AuthService.updateProfile(formData);

        // Si todo salió bien:
        // 1. Actualizamos los datos "Oficiales" con la respuesta
        const updatedUser = response.data.user;
        currentUser.value.name = updatedUser.name;
        currentUser.value.email = updatedUser.email;

        if (response.data.avatar_url) {
            currentUser.value.avatar_url = response.data.avatar_url;
        }

        // 2. Salimos del modo edición
        isEditing.value = false;
        selectedFile.value = null;
        previewAvatar.value = null;

        // 3. Feedback visual
        const toast = await toastController.create({
            message: 'Perfil actualizado correctamente',
            duration: 2000,
            color: 'success',
            position: 'bottom'
        });
        await toast.present();

    } catch (error: any) {
        console.error(error);
        const msg = error.response?.data?.message || "Error al actualizar";
        alert("No se pudo guardar: " + msg);
    } finally {
        loading.dismiss();
    }
};

// --- 5. CERRAR SESIÓN ---
const logout = async () => {
    const alert = await alertController.create({
        header: 'Cerrar Sesión',
        message: '¿Seguro que quieres salir?',
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Salir',
                role: 'destructive',
                handler: async () => {
                    await AuthService.logout();
                    router.replace('/login'); // Usamos replace para no poder volver atrás
                }
            }
        ]
    });
    await alert.present();
};
</script>
<style scoped>
/* Estilo para el botón flotante de la cámara */
.camera-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    background: var(--ion-color-primary);
    color: white;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
}

.camera-btn:active {
    transform: scale(0.9);
}

/* Estilo visual para cuando los inputs están bloqueados */
.item-readonly {
    --background: transparent;
    opacity: 0.9;
}
</style>