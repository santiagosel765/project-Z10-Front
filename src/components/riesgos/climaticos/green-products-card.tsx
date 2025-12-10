
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Leaf, Droplets, Sun, Wind } from "lucide-react";

const greenProducts = [
  { name: "Paneles Solares", icon: Sun, description: "Reduzca costos de energía y aumente la resiliencia energética." },
  { name: "Sistemas de Riego Eficiente", icon: Droplets, description: "Optimice el uso del agua en la agricultura ante sequías." },
  { name: "Bombas de Agua Solares", icon: Droplets, description: "Asegure el suministro de agua de forma sostenible." },
  { name: "Sistemas de Agricultura Protegida", icon: Leaf, description: "Proteja cultivos de eventos climáticos extremos." },
];

export function GreenProductsCard() {
  return (
    <Card className="bg-muted/30 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="text-green-500" />
          Catálogo de Productos Verdes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Fomente la resiliencia de sus clientes con nuestra línea de productos sostenibles.
        </p>
        <div className="space-y-4">
          {greenProducts.map((product) => (
            <div key={product.name} className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                 <product.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
