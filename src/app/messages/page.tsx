"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserBrief {
  id: string;
  name: string | null;
  image: string | null;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: UserBrief;
  receiver: UserBrief;
}

interface Conversation {
  otherUser: UserBrief;
  lastMessage: Message | null;
  unreadCount: number;
}

function MessagesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeUserId = searchParams.get("userId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        setConversations(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (userId: string) => {
    const res = await fetch(
      `/api/messages/conversations?userId=${encodeURIComponent(userId)}`
    );
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      fetchConversations();
    }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeUserId) return;
    fetchMessages(activeUserId);
    const interval = setInterval(() => fetchMessages(activeUserId), 5000);
    return () => clearInterval(interval);
  }, [activeUserId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !activeUserId || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeUserId, content: input.trim() }),
      });
      if (res.ok) {
        const msg: Message = await res.json();
        setMessages((prev) => [...prev, msg]);
        setInput("");
        fetchConversations();
      }
    } finally {
      setSending(false);
    }
  }

  function selectConversation(userId: string) {
    router.push(`/messages?userId=${userId}`);
  }

  function goBack() {
    router.push("/messages");
  }

  const activeConversation = conversations.find(
    (c) => c.otherUser.id === activeUserId
  );

  return (
    <div className="container mx-auto flex h-[calc(100dvh-8rem)] max-w-5xl px-4 py-4">
      {/* Sidebar */}
      <div
        className={`w-80 shrink-0 border-r pr-4 ${
          activeUserId ? "hidden md:block" : "block"
        }`}
      >
        <h1 className="mb-4 text-xl font-bold">Messages</h1>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-3 w-40 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          <ScrollArea className="h-[calc(100dvh-12rem)]">
            {conversations.map((convo) => (
              <button
                key={convo.otherUser.id}
                onClick={() => selectConversation(convo.otherUser.id)}
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted ${
                  activeUserId === convo.otherUser.id ? "bg-muted" : ""
                }`}
              >
                <Avatar>
                  <AvatarImage src={convo.otherUser.image ?? undefined} />
                  <AvatarFallback>
                    {convo.otherUser.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium">
                      {convo.otherUser.name ?? "Anonymous"}
                    </span>
                    {convo.unreadCount > 0 && (
                      <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                  {convo.lastMessage && (
                    <p className="truncate text-xs text-muted-foreground">
                      {convo.lastMessage.senderId === convo.otherUser.id
                        ? ""
                        : "You: "}
                      {convo.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </ScrollArea>
        )}
      </div>

      {/* Main Panel */}
      <div
        className={`flex flex-1 flex-col ${
          activeUserId ? "block" : "hidden md:flex"
        }`}
      >
        {activeUserId && activeConversation ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b pb-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage
                  src={activeConversation.otherUser.image ?? undefined}
                />
                <AvatarFallback>
                  {activeConversation.otherUser.name
                    ?.charAt(0)
                    ?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {activeConversation.otherUser.name ?? "Anonymous"}
              </span>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${
                    msg.senderId === activeUserId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                      msg.senderId === activeUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="flex items-center gap-2 border-t pt-3">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={sending}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || sending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex h-[calc(100dvh-8rem)] max-w-5xl items-center justify-center px-4">
          <div className="animate-pulse text-muted-foreground">Loading messages...</div>
        </div>
      }
    >
      <MessagesPageInner />
    </Suspense>
  );
}
