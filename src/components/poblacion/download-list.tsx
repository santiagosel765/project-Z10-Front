"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DownloadableFile } from "@/types";

interface DownloadListProps {
    files: DownloadableFile[];
}

export function DownloadList({ files }: DownloadListProps) {
    return (
        <div>
            <h3 className="text-sm font-semibold mb-2">Archivos Disponibles</h3>
            <ul className="space-y-2">
                {files.map(file => (
                    <li key={file.name}>
                        <Button 
                            variant="outline" 
                            className="w-full justify-start" 
                            asChild
                        >
                            <a href={file.url} download>
                                <Download className="mr-2 h-4 w-4" />
                                <span className="truncate">{file.name}</span>
                            </a>
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
