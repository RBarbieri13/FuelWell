"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Send, Sparkles, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! I'm your FuelWell nutrition coach. Ask me anything about your diet, meal ideas, or how to hit your macros today. I'm here to help!",
  timestamp: new Date(),
};

const QUICK_PROMPTS = [
  "What should I eat for lunch?",
  "How can I get more protein?",
  "Am I on track today?",
  "Suggest a healthy snack",
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function addMessage(content: string) {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (will be replaced with real API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: getSimulatedResponse(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addMessage(input);
  }

  function handleQuickPrompt(prompt: string) {
    addMessage(prompt);
  }

  const showQuickPrompts = messages.length <= 1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 md:px-8 py-4 border-b border-neutral-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm shadow-primary-600/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-neutral-900">
              AI Coach
            </h1>
            <p className="text-xs text-neutral-400">
              {isTyping ? "Typing..." : "Online"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary-600 text-white rounded-br-md"
                    : "bg-neutral-100 text-neutral-800 rounded-bl-md"
                )}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              </div>
              <div className="bg-neutral-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Quick prompts */}
          {showQuickPrompts && (
            <div className="pt-4">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
                Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-3.5 py-2 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-150"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-neutral-100 bg-white px-4 md:px-8 py-3">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything..."
            className="flex-1 px-4 py-2.5 bg-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors placeholder:text-neutral-400"
            disabled={isTyping}
          />
          <Button
            type="submit"
            size="md"
            disabled={!input.trim() || isTyping}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function getSimulatedResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("lunch") || lower.includes("eat")) {
    return "Based on your goals, I'd suggest a lean protein with complex carbs — like grilled chicken with quinoa and roasted veggies. That'll give you about 450 cal with 35g protein. Want me to log that for you?";
  }
  if (lower.includes("protein")) {
    return "Great question! Here are some high-protein options: Greek yogurt (17g per serving), cottage cheese (14g), chicken breast (31g per 100g), or eggs (6g each). Try adding one of these to your next meal.";
  }
  if (lower.includes("track") || lower.includes("on track")) {
    return "Looking at your log today, you're doing well! You've got a good balance of macros so far. Just make sure to get some more protein in your next meal to hit your daily target.";
  }
  if (lower.includes("snack")) {
    return "For a healthy snack, try: apple slices with almond butter (200 cal, 7g protein), a handful of mixed nuts (170 cal, 5g protein), or a protein shake (120 cal, 25g protein). Which sounds good?";
  }

  return "That's a great question! I'd love to help you with that. Could you give me a bit more context about your current goals or what you had in mind? The more specific you are, the better advice I can give.";
}
