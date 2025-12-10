
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, RefreshCw, Volume2, LoaderCircle } from "lucide-react";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { continueChat, ChatInput } from "@/ai/flows/chat-flow";
import { textToSpeech, TTSInput } from "@/ai/flows/tts-flow";

interface Message {
  id: number;
  role: "user" | "model" | "system";
  text: string;
}

export function AiChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "model", text: "Hola, soy el asistente de IA de ZENIT. ¿En qué puedo ayudarte hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioState, setAudioState] = useState<{ playingId: number | null, loadingId: number | null }>({
    playingId: null,
    loadingId: null,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;
    
    const userMessage: Message = { id: Date.now(), role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = messages.map(({id, ...rest}) => rest);
      const chatInput: ChatInput = {
        history: chatHistory,
        prompt: input,
      };
      const result = await continueChat(chatInput);
      const aiMessage: Message = { id: Date.now() + 1, role: "model", text: result.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = { id: Date.now() + 1, role: "model", text: "Lo siento, no pude procesar tu solicitud en este momento." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (message: Message) => {
    if (audioState.loadingId === message.id || audioState.playingId === message.id) return;
    
    setAudioState({ ...audioState, loadingId: message.id });

    try {
        const input: TTSInput = { text: message.text };
        const response = await textToSpeech(input);

        if (audioRef.current) {
            audioRef.current.pause();
        }
        
        audioRef.current = new Audio(response.audio);
        audioRef.current.play();

        setAudioState({ playingId: message.id, loadingId: null });

        audioRef.current.onended = () => {
             setAudioState({ playingId: null, loadingId: null });
        };
    } catch (err) {
        console.error('Failed to play audio:', err);
        setAudioState({ playingId: null, loadingId: null });
    }
  };


  return (
    <div className="flex h-full flex-col">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Bot /> Asistente IA
        </SheetTitle>
        <SheetDescription>
            Haz preguntas sobre tus datos, solicita análisis o pide ayuda.
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            message.role !== 'system' &&
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? "justify-end" : ""
              }`}
            >
              {message.role === 'model' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <div
                className={`max-w-xs rounded-lg p-3 text-sm ${
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.text}
              </div>
              {message.role === 'model' && (
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handlePlayAudio(message)}
                    disabled={audioState.loadingId === message.id}
                  >
                    {audioState.loadingId === message.id ? (
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                        <Volume2 className={`h-5 w-5 ${audioState.playingId === message.id ? 'text-primary' : ''}`} />
                    )}
                 </Button>
              )}
              {message.role === 'user' && (
                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
                    <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div className="max-w-xs rounded-lg p-3 text-sm bg-muted flex items-center">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="ml-2">Pensando...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe un mensaje..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Enviar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
