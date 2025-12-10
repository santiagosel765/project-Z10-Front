import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZENIT Map Embed",
  description: "Embedded map viewer for ZENIT GeoAI",
};

/**
 * Layout para páginas de embed
 * Sin navegación, header o sidebar - solo el contenido
 */
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen overflow-hidden flex">
      <div className="w-full h-full flex flex-col">{children}</div>
    </div>
  );
}
