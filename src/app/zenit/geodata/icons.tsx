"use client";

import { 
    Printer, 
    Link as WebLink, 
    Search, 
    HelpCircle as Help, 
    Download, 
    Plus as Add,
    ChevronsLeft as ChevronDoubleLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight as ChevronDoubleRight,
    Eye,
    EyeOff as EyeSlash,
    Trash2 as Trash
} from 'lucide-react';

export const ICONS = {
    Print: () => <Printer size={16} />,
    WebLink: () => <WebLink size={16} />,
    Search: () => <Search size={14} />,
    Help: () => <Help size={16} />,
    Download: () => <Download size={16} />,
    Add: () => <Add size={16} />,
    ChevronDoubleLeft: () => <ChevronDoubleLeft size={16} />,
    ChevronLeft: () => <ChevronLeft size={16} />,
    ChevronRight: () => <ChevronRight size={16} />,
    ChevronDoubleRight: () => <ChevronDoubleRight size={16} />,
    Eye: () => <Eye size={16} />,
    EyeSlash: () => <EyeSlash size={16} />,
    Trash: () => <Trash size={16} />,
};
