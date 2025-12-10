
"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Camera, Palette, Bell, Moon, Sun, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageCropper } from "@/components/profile/image-cropper";

export default function PerfilPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [cropperOpen, setCropperOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: "destructive",
        title: "Archivo inválido",
        description: "Por favor, seleccione un archivo de imagen.",
      });
    }
    if(event.target) {
        event.target.value = "";
    }
  };

  const handleAvatarButtonClick = () => {
    document.getElementById('avatar-input')?.click();
  };

  const handleCropComplete = (croppedImage: string) => {
    updateUser({ avatar: croppedImage });
    setCropperOpen(false);
    toast({
      title: "Foto de perfil actualizada",
      description: "Tu nueva foto de perfil ha sido guardada.",
    });
  };
  
  if (!user) {
    return null; 
  }

  const currentAvatarSrc = user.avatar || "https://placehold.co/100x100.png";

  return (
    <>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">Configuración de Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal, apariencia y notificaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="md:col-span-1 bg-muted/30">
            <CardHeader className="items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentAvatarSrc} alt={user.username} data-ai-hint="man portrait"/>
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  id="avatar-input"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8" onClick={handleAvatarButtonClick}>
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Cambiar foto</span>
                </Button>
              </div>
              <CardTitle className="mt-4">{user.username}</CardTitle>
              <CardDescription>{user.roles?.[0]?.name || 'user'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" defaultValue={`${user.firstName} ${user.lastName}`} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Guardar Cambios</Button>
            </CardFooter>
          </Card>

          <div className="space-y-8 md:col-span-2">
            <Card className="bg-muted/30">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Bell /> Notificaciones
                  </CardTitle>
                  <CardDescription>Elige cómo quieres recibir las notificaciones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                   <div>
                    <Label htmlFor="email-notifications">Notificaciones por Correo</Label>
                     <p className="text-sm text-muted-foreground">
                      Recibe notificaciones importantes en tu correo.
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="whatsapp-notifications">Notificaciones por WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe alertas y resúmenes a través de WhatsApp.
                    </p>
                  </div>
                  <Switch id="whatsapp-notifications" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {selectedImage && (
        <ImageCropper
          imageSrc={selectedImage}
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}
