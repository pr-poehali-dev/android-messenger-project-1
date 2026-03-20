import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type Screen = "chats" | "contacts" | "profile" | "settings" | "search" | "notifications" | "chat" | "create-group" | "group-settings" | "call";

type CallState = "calling" | "connected" | "ended";

type MemberRole = "admin" | "moderator" | "member";

interface GroupMember {
  contact: Contact;
  role: MemberRole;
}

interface Message {
  id: number;
  text: string;
  out: boolean;
  time: string;
  read?: boolean;
  image?: string;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup: boolean;
  members?: number;
  typing?: boolean;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  status: string;
  online: boolean;
  phone: string;
}

const CHATS: Chat[] = [
  { id: 1, name: "Алексей Петров", avatar: "avatar-grad-1", lastMsg: "Отлично, встречаемся завтра!", time: "14:32", unread: 3, online: true, isGroup: false },
  { id: 2, name: "Команда Pulse", avatar: "avatar-grad-2", lastMsg: "Юра: Дизайн готов, смотрите", time: "13:10", unread: 12, online: false, isGroup: true, members: 8 },
  { id: 3, name: "Мария Соколова", avatar: "avatar-grad-3", lastMsg: "Спасибо за помощь 🙏", time: "11:05", unread: 0, online: true, isGroup: false },
  { id: 4, name: "Разработчики", avatar: "avatar-grad-4", lastMsg: "Баг пофиксили, деплой сделан", time: "Вчера", unread: 0, online: false, isGroup: true, members: 24 },
  { id: 5, name: "Игорь Романов", avatar: "avatar-grad-5", lastMsg: "Пришли файл когда будет готов", time: "Вчера", unread: 1, online: false, isGroup: false },
  { id: 6, name: "Маркетинг", avatar: "avatar-grad-6", lastMsg: "Новая кампания запущена!", time: "Пн", unread: 0, online: false, isGroup: true, members: 6 },
  { id: 7, name: "Дарья Волкова", avatar: "avatar-grad-1", lastMsg: "Окей, договорились!", time: "Пн", unread: 0, online: true, isGroup: false },
];

const MESSAGES: Message[] = [
  { id: 1, text: "Привет! Как дела с проектом?", out: false, time: "10:00" },
  { id: 2, text: "Всё отлично! Работаю над новым дизайном", out: true, time: "10:02", read: true },
  { id: 3, text: "Когда можешь показать результат?", out: false, time: "10:05" },
  { id: 4, text: "Уже сегодня вечером пришлю первую версию 🚀", out: true, time: "10:07", read: true },
  { id: 5, text: "Отлично! Буду ждать. Кстати, клиент очень доволен последними правками", out: false, time: "10:10" },
  { id: 6, text: "Это вдохновляет работать ещё усерднее 💪", out: true, time: "10:12", read: true },
  { id: 7, text: "Отлично, встречаемся завтра!", out: false, time: "14:32" },
];

const CONTACTS: Contact[] = [
  { id: 1, name: "Алексей Петров", avatar: "avatar-grad-1", status: "На работе", online: true, phone: "+7 900 123-45-67" },
  { id: 2, name: "Дарья Волкова", avatar: "avatar-grad-1", status: "Не беспокоить", online: true, phone: "+7 911 234-56-78" },
  { id: 3, name: "Игорь Романов", avatar: "avatar-grad-5", status: "В дороге", online: false, phone: "+7 922 345-67-89" },
  { id: 4, name: "Мария Соколова", avatar: "avatar-grad-3", status: "Свободна для общения", online: true, phone: "+7 933 456-78-90" },
  { id: 5, name: "Никита Фролов", avatar: "avatar-grad-4", status: "Занят", online: false, phone: "+7 944 567-89-01" },
  { id: 6, name: "Ольга Кузнецова", avatar: "avatar-grad-6", status: "Пью кофе ☕", online: false, phone: "+7 955 678-90-12" },
];

const NOTIFICATIONS = [
  { id: 1, icon: "MessageCircle", color: "text-purple-400", bg: "bg-purple-500/10", title: "Алексей Петров", text: "Отлично, встречаемся завтра!", time: "14:32", unread: true },
  { id: 2, icon: "Users", color: "text-cyan-400", bg: "bg-cyan-500/10", title: "Команда Pulse", text: "Юра добавил новый файл", time: "13:10", unread: true },
  { id: 3, icon: "UserPlus", color: "text-green-400", bg: "bg-green-500/10", title: "Новый контакт", text: "Ольга Кузнецова добавила вас", time: "11:00", unread: true },
  { id: 4, icon: "Bell", color: "text-orange-400", bg: "bg-orange-500/10", title: "Напоминание", text: "Встреча с командой через 30 минут", time: "Вчера", unread: false },
  { id: 5, icon: "Shield", color: "text-pink-400", bg: "bg-pink-500/10", title: "Безопасность", text: "Новый вход с устройства iPhone", time: "Вчера", unread: false },
];

const NAV_ITEMS = [
  { id: "chats", icon: "MessageCircle", label: "Чаты" },
  { id: "contacts", icon: "Users", label: "Контакты" },
  { id: "search", icon: "Search", label: "Поиск" },
  { id: "notifications", icon: "Bell", label: "Уведом." },
  { id: "profile", icon: "User", label: "Профиль" },
];

export default function Index() {
  const [screen, setScreen] = useState<Screen>("chats");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"chats" | "contacts">("chats");
  const [chats, setChats] = useState<Chat[]>(CHATS);
  const [callContact, setCallContact] = useState<Chat | null>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([
    { contact: CONTACTS[0], role: "admin" },
    { contact: CONTACTS[1], role: "moderator" },
    { contact: CONTACTS[2], role: "member" },
    { contact: CONTACTS[3], role: "member" },
    { contact: CONTACTS[4], role: "member" },
  ]);

  const navigate = (s: Screen) => {
    setScreen(s);
    setActiveChat(null);
  };

  const openChat = (chat: Chat) => {
    setActiveChat(chat);
    setScreen("chat");
  };

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: msgInput,
      out: true,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      read: false,
    }]);
    setMsgInput("");
  };

  const sendImage = (dataUrl: string) => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: "",
      out: true,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      image: dataUrl,
    }]);
  };

  const handleGroupCreate = (name: string, members: GroupMember[]) => {
    const newGroup: Chat = {
      id: chats.length + 1,
      name,
      avatar: `avatar-grad-${(chats.length % 6) + 1}`,
      lastMsg: "Группа создана",
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      unread: 0,
      online: false,
      isGroup: true,
      members: members.length + 1,
    };
    setChats(prev => [newGroup, ...prev]);
    setScreen("chats");
  };

  const totalUnread = chats.reduce((a, c) => a + c.unread, 0);
  const notifUnread = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden" style={{ maxWidth: 480, margin: "0 auto", background: "hsl(240,15%,6%)" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="absolute top-[-100px] left-[-60px] w-72 h-72 rounded-full opacity-20 animate-orb"
          style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
        <div className="absolute bottom-20 right-[-40px] w-56 h-56 rounded-full opacity-15 animate-orb"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)", animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full opacity-10 animate-orb"
          style={{ background: "radial-gradient(circle, #f472b6, transparent 70%)", animationDelay: "6s" }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative z-10">
        {screen === "chats" && <ChatsScreen chats={chats} onChatClick={openChat} onCreateGroup={() => setScreen("create-group")} />}
        {screen === "create-group" && <CreateGroupScreen contacts={CONTACTS} onBack={() => setScreen("chats")} onCreate={handleGroupCreate} />}
        {screen === "contacts" && <ContactsScreen contacts={CONTACTS} onChatClick={(c) => {
          const chat = CHATS.find(ch => ch.name === c.name);
          if (chat) openChat(chat);
        }} />}
        {screen === "search" && (
          <SearchScreen
            chats={CHATS}
            contacts={CONTACTS}
            query={searchQuery}
            setQuery={setSearchQuery}
            onChatClick={openChat}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
        {screen === "notifications" && <NotificationsScreen notifications={NOTIFICATIONS} />}
        {screen === "profile" && <ProfileScreen onSettings={() => setScreen("settings")} />}
        {screen === "settings" && <SettingsScreen onBack={() => setScreen("profile")} />}
        {screen === "group-settings" && activeChat && (
          <GroupSettingsScreen
            chat={activeChat}
            members={groupMembers}
            onBack={() => setScreen("chat")}
            onUpdateMembers={setGroupMembers}
            onUpdateChat={(updated) => {
              setChats(prev => prev.map(c => c.id === updated.id ? updated : c));
              setActiveChat(updated);
            }}
          />
        )}
        {screen === "call" && callContact && (
          <CallScreen
            chat={callContact}
            isVideo={isVideoCall}
            onEnd={() => { setScreen("chat"); setCallContact(null); }}
          />
        )}
        {screen === "chat" && activeChat && (
          <ChatScreen
            chat={activeChat}
            messages={messages}
            input={msgInput}
            setInput={setMsgInput}
            onSend={sendMessage}
            onSendImage={sendImage}
            onBack={() => setScreen("chats")}
            onGroupSettings={activeChat.isGroup ? () => setScreen("group-settings") : undefined}
            onCall={(video) => {
              setCallContact(activeChat);
              setIsVideoCall(video);
              setScreen("call");
            }}
          />
        )}
      </div>

      {/* Bottom nav */}
      {screen !== "chat" && screen !== "settings" && screen !== "create-group" && screen !== "group-settings" && screen !== "call" && (
        <div className="relative z-20 glass border-t border-white/5 px-4 pt-3 pb-6">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map(item => {
              const isActive = screen === item.id;
              const badge = item.id === "chats" ? totalUnread : item.id === "notifications" ? notifUnread : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id as Screen)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl nav-pill ${isActive ? "active" : ""}`}
                >
                  <div className="relative">
                    <Icon
                      name={item.icon}
                      size={22}
                      className={isActive ? "text-purple-400" : "text-white/40"}
                    />
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                        style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}>
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-purple-400" : "text-white/30"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────── CHATS SCREEN ──────── */
function ChatsScreen({ chats, onChatClick, onCreateGroup }: { chats: Chat[]; onChatClick: (c: Chat) => void; onCreateGroup: () => void }) {
  return (
    <div className="h-full flex flex-col screen">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Сообщения</h1>
            <p className="text-white/40 text-sm">
              {chats.filter(c => c.unread > 0).length} непрочитанных чатов
            </p>
          </div>
          <button onClick={onCreateGroup} className="w-10 h-10 rounded-2xl glass flex items-center justify-center group">
            <Icon name="Plus" size={18} className="text-purple-400 group-active:scale-90 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
        {chats.map((chat, i) => (
          <button
            key={chat.id}
            onClick={() => onChatClick(chat)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/4 active:bg-white/8 transition-all text-left"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="relative flex-shrink-0">
              <div className={`w-[52px] h-[52px] rounded-2xl ${chat.avatar} flex items-center justify-center text-white font-bold text-lg`}>
                {chat.isGroup
                  ? <Icon name="Users" size={22} className="text-white/90" />
                  : chat.name.charAt(0)
                }
              </div>
              {chat.online && !chat.isGroup && (
                <div className="absolute -bottom-0.5 -right-0.5 online-dot" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-white text-sm truncate">{chat.name}</span>
                <span className="text-white/30 text-xs flex-shrink-0 ml-2">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45 text-xs truncate">
                  {chat.typing
                    ? <span className="text-purple-400">печатает...</span>
                    : chat.lastMsg
                  }
                </span>
                {chat.unread > 0 && (
                  <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}>
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ──────── CHAT SCREEN ──────── */
function ChatScreen({ chat, messages, input, setInput, onSend, onSendImage, onBack, onGroupSettings, onCall }: {
  chat: Chat; messages: Message[]; input: string;
  setInput: (v: string) => void; onSend: () => void; onSendImage: (url: string) => void; onBack: () => void;
  onGroupSettings?: () => void;
  onCall?: (video: boolean) => void;
}) {
  const [showMediaPanel, setShowMediaPanel] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreviewImg(result);
      setShowMediaPanel(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const confirmSendImage = () => {
    if (previewImg) {
      onSendImage(previewImg);
      setPreviewImg(null);
    }
  };

  return (
    <div className="h-full flex flex-col screen relative">
      <div className="glass border-b border-white/5 px-4 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl glass">
            <Icon name="ChevronLeft" size={20} className="text-white/70" />
          </button>
          <button onClick={onGroupSettings} disabled={!onGroupSettings} className="flex items-center gap-2 flex-1 min-w-0 text-left">
            <div className={`w-10 h-10 rounded-xl ${chat.avatar} flex items-center justify-center text-white font-bold flex-shrink-0`}>
              {chat.isGroup
                ? <Icon name="Users" size={16} className="text-white/90" />
                : chat.name.charAt(0)
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm">{chat.name}</div>
              <div className="text-xs">
                {chat.isGroup
                  ? <span className="text-white/40">{chat.members} участников · нажмите для настроек</span>
                  : chat.online
                    ? <span className="text-green-400">онлайн</span>
                    : <span className="text-white/40">был(а) давно</span>
                }
              </div>
            </div>
          </button>
          <div className="flex gap-1">
            {!chat.isGroup && onCall && (
              <>
                <button onClick={() => onCall(false)} className="w-9 h-9 flex items-center justify-center rounded-xl glass">
                  <Icon name="Phone" size={16} className="text-purple-400" />
                </button>
                <button onClick={() => onCall(true)} className="w-9 h-9 flex items-center justify-center rounded-xl glass">
                  <Icon name="Video" size={16} className="text-cyan-400" />
                </button>
              </>
            )}
            {chat.isGroup && onGroupSettings && (
              <button onClick={onGroupSettings} className="w-9 h-9 flex items-center justify-center rounded-xl glass">
                <Icon name="Settings2" size={16} className="text-purple-400" />
              </button>
            )}
            <button className="w-9 h-9 flex items-center justify-center rounded-xl glass">
              <Icon name="MoreVertical" size={16} className="text-white/50" />
            </button>
          </div>
        </div>
      </div>

      {/* Image preview modal */}
      {previewImg && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full px-5 flex flex-col items-center gap-4">
            <p className="text-white/60 text-sm">Отправить изображение?</p>
            <div className="w-full max-h-[60vh] rounded-2xl overflow-hidden border border-white/10">
              <img src={previewImg} alt="preview" className="w-full h-full object-contain" style={{ maxHeight: "60vh" }} />
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setPreviewImg(null)}
                className="flex-1 py-3 rounded-2xl glass text-white/60 text-sm font-medium">
                Отмена
              </button>
              <button onClick={confirmSendImage}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold glow-purple"
                style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}>
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={msg.id} className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-fade-in`}
            style={{ animationDelay: `${i * 30}ms` }}>
            {msg.image ? (
              <div className={`max-w-[75%] overflow-hidden rounded-2xl border ${msg.out ? "border-purple-500/20" : "border-white/8"}`}>
                <img src={msg.image} alt="фото" className="w-full object-cover" style={{ maxHeight: 280 }} />
                <div className={`flex items-center gap-1 px-3 py-1.5 ${msg.out ? "justify-end bg-purple-900/30" : "justify-start bg-white/5"}`}>
                  <span className="text-[10px] text-white/40">{msg.time}</span>
                  {msg.out && (
                    <Icon name={msg.read ? "CheckCheck" : "Check"} size={12} className={msg.read ? "text-cyan-400" : "text-white/30"} />
                  )}
                </div>
              </div>
            ) : (
              <div className={`max-w-[75%] px-4 py-2.5 ${msg.out ? "bubble-out" : "bubble-in"}`}>
                <p className="text-white text-sm leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${msg.out ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px] text-white/40">{msg.time}</span>
                  {msg.out && (
                    <Icon name={msg.read ? "CheckCheck" : "Check"} size={12} className={msg.read ? "text-cyan-400" : "text-white/30"} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-start">
          <div className="bubble-in px-4 py-3 flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-typing"
                style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Media panel */}
      {showMediaPanel && (
        <div className="glass border-t border-white/5 px-4 pt-3 pb-2 animate-slide-up">
          <div className="flex gap-3 mb-3">
            {[
              { icon: "Image", label: "Галерея", action: () => fileInputRef.current?.click() },
              { icon: "Camera", label: "Камера", action: () => fileInputRef.current?.click() },
              { icon: "File", label: "Файл", action: () => fileInputRef.current?.click() },
              { icon: "MapPin", label: "Геолокация", action: () => setShowMediaPanel(false) },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl glass flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.15),rgba(99,102,241,0.15))", border: "1px solid rgba(168,85,247,0.2)" }}>
                  <Icon name={item.icon} size={22} className="text-purple-400" />
                </div>
                <span className="text-white/40 text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="glass border-t border-white/5 px-4 pt-3 pb-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowMediaPanel(v => !v)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 transition-all ${showMediaPanel ? "glow-purple" : "glass"}`}
            style={showMediaPanel ? { background: "linear-gradient(135deg,#a855f7,#6366f1)" } : {}}
          >
            <Icon name={showMediaPanel ? "X" : "Plus"} size={18} className={showMediaPanel ? "text-white" : "text-white/50"} />
          </button>
          <div className="flex-1 glass rounded-2xl px-4 py-2.5 flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder="Написать сообщение..."
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder-white/25 outline-none resize-none"
              style={{ maxHeight: 100 }}
            />
            <button onClick={() => fileInputRef.current?.click()} className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0">
              <Icon name="Image" size={17} className="text-white/30" />
            </button>
          </div>
          <button
            onClick={onSend}
            className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 glow-purple transition-transform active:scale-90"
            style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}
          >
            <Icon name="Send" size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────── CONTACTS SCREEN ──────── */
function ContactsScreen({ contacts, onChatClick }: { contacts: Contact[]; onChatClick: (c: Contact) => void }) {
  return (
    <div className="h-full flex flex-col screen">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Контакты</h1>
        <p className="text-white/40 text-sm">{contacts.length} контактов</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="mb-4">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider px-2 mb-2">В сети</p>
          {contacts.filter(c => c.online).map(contact => (
            <ContactItem key={contact.id} contact={contact} onClick={() => onChatClick(contact)} />
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 mb-2">Все контакты</p>
          {contacts.filter(c => !c.online).map(contact => (
            <ContactItem key={contact.id} contact={contact} onClick={() => onChatClick(contact)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactItem({ contact, onClick }: { contact: Contact; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/4 transition-all text-left">
      <div className="relative flex-shrink-0">
        <div className={`w-12 h-12 rounded-2xl ${contact.avatar} flex items-center justify-center text-white font-bold`}>
          {contact.name.charAt(0)}
        </div>
        {contact.online && <div className="absolute -bottom-0.5 -right-0.5 online-dot" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm">{contact.name}</div>
        <div className="text-white/40 text-xs truncate">{contact.status}</div>
      </div>
      <button className="w-8 h-8 rounded-xl glass flex items-center justify-center">
        <Icon name="MessageCircle" size={14} className="text-purple-400" />
      </button>
    </button>
  );
}

/* ──────── SEARCH SCREEN ──────── */
function SearchScreen({ chats, contacts, query, setQuery, onChatClick, activeTab, setActiveTab }: {
  chats: Chat[]; contacts: Contact[]; query: string; setQuery: (v: string) => void;
  onChatClick: (c: Chat) => void; activeTab: "chats" | "contacts"; setActiveTab: (v: "chats" | "contacts") => void;
}) {
  const q = query.toLowerCase();
  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(q) || c.lastMsg.toLowerCase().includes(q));
  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));

  return (
    <div className="h-full flex flex-col screen">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-display text-2xl font-bold text-white mb-4">Поиск</h1>
        <div className="glass rounded-2xl flex items-center gap-3 px-4 py-3">
          <Icon name="Search" size={18} className="text-white/30 flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск чатов и контактов..."
            className="flex-1 bg-transparent text-white text-sm placeholder-white/25 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <Icon name="X" size={16} className="text-white/30" />
            </button>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          {(["chats", "contacts"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? "text-white" : "text-white/40 glass"}`}
              style={activeTab === tab ? { background: "linear-gradient(135deg,#a855f7,#6366f1)" } : {}}
            >
              {tab === "chats" ? "Чаты" : "Контакты"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {!query && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center mb-4">
              <Icon name="Search" size={28} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm">Начните вводить запрос</p>
          </div>
        )}

        {query && activeTab === "chats" && (
          filteredChats.length === 0
            ? <p className="text-center text-white/30 text-sm mt-8">Ничего не найдено</p>
            : filteredChats.map(chat => (
              <button key={chat.id} onClick={() => onChatClick(chat)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/4 transition-all text-left">
                <div className={`w-11 h-11 rounded-xl ${chat.avatar} flex items-center justify-center text-white font-bold`}>
                  {chat.isGroup ? <Icon name="Users" size={18} className="text-white/90" /> : chat.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{chat.name}</div>
                  <div className="text-white/40 text-xs truncate">{chat.lastMsg}</div>
                </div>
              </button>
            ))
        )}

        {query && activeTab === "contacts" && (
          filteredContacts.length === 0
            ? <p className="text-center text-white/30 text-sm mt-8">Ничего не найдено</p>
            : filteredContacts.map(c => (
              <button key={c.id} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/4 transition-all text-left">
                <div className={`w-11 h-11 rounded-xl ${c.avatar} flex items-center justify-center text-white font-bold`}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{c.name}</div>
                  <div className="text-white/40 text-xs">{c.phone}</div>
                </div>
              </button>
            ))
        )}
      </div>
    </div>
  );
}

/* ──────── NOTIFICATIONS SCREEN ──────── */
function NotificationsScreen({ notifications }: { notifications: typeof NOTIFICATIONS }) {
  return (
    <div className="h-full flex flex-col screen">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Уведомления</h1>
            <p className="text-white/40 text-sm">{notifications.filter(n => n.unread).length} новых</p>
          </div>
          <button className="text-purple-400 text-sm font-medium">Прочитать все</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {notifications.map((n, i) => (
          <div key={n.id}
            className={`flex items-start gap-3 px-4 py-4 rounded-2xl transition-all ${n.unread ? "glass border border-purple-500/15" : "bg-white/2"}`}
            style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`w-10 h-10 rounded-2xl ${n.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={n.icon} size={18} className={n.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-white text-sm">{n.title}</span>
                <span className="text-white/30 text-xs">{n.time}</span>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">{n.text}</p>
            </div>
            {n.unread && <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────── PROFILE SCREEN ──────── */
function ProfileScreen({ onSettings }: { onSettings: () => void }) {
  return (
    <div className="h-full flex flex-col screen overflow-y-auto pb-4">
      <div className="relative px-5 pt-12 pb-8 text-center">
        <div className="absolute top-0 left-0 right-0 h-48 opacity-30"
          style={{ background: "radial-gradient(ellipse at 50% 0%, #a855f7 0%, transparent 70%)" }} />
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl avatar-grad-2 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold glow-purple animate-float">
            Ю
          </div>
          <h2 className="font-display text-2xl font-bold text-white">Юра Космонавт</h2>
          <p className="text-white/40 text-sm mt-1">@yura_dev · Разработчик</p>

          <div className="flex justify-center gap-6 mt-5">
            {[{ n: "248", l: "Сообщений" }, { n: "42", l: "Контактов" }, { n: "8", l: "Групп" }].map(s => (
              <div key={s.l} className="text-center">
                <div className="font-bold text-white text-lg gradient-text">{s.n}</div>
                <div className="text-white/30 text-xs">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 mb-5">
        <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-white font-medium text-sm"
            style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}>
            <Icon name="Edit2" size={16} className="text-white" />
            Редактировать
          </button>
          <button className="w-12 h-12 rounded-2xl glass flex items-center justify-center">
            <Icon name="Share2" size={18} className="text-white/60" />
          </button>
          <button onClick={onSettings} className="w-12 h-12 rounded-2xl glass flex items-center justify-center">
            <Icon name="Settings" size={18} className="text-white/60" />
          </button>
        </div>
      </div>

      <div className="px-5 space-y-2">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-1">Информация</p>
        {[
          { icon: "Phone", text: "+7 900 000-00-00", color: "text-purple-400" },
          { icon: "Mail", text: "yura@pulse.dev", color: "text-cyan-400" },
          { icon: "MapPin", text: "Москва, Россия", color: "text-green-400" },
          { icon: "Globe", text: "pulse.dev/yura", color: "text-orange-400" },
        ].map(item => (
          <div key={item.text} className="glass rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <Icon name={item.icon} size={16} className={item.color} />
            <span className="text-white/80 text-sm">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="px-5 mt-5 space-y-2">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-1">Групповые права</p>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5">
          {[
            { icon: "Shield", label: "Администратор", group: "Команда Pulse", color: "text-purple-400" },
            { icon: "Users", label: "Участник", group: "Разработчики", color: "text-cyan-400" },
            { icon: "Star", label: "Модератор", group: "Маркетинг", color: "text-yellow-400" },
          ].map(item => (
            <div key={item.group} className="flex items-center gap-3 px-4 py-3">
              <Icon name={item.icon} size={16} className={item.color} />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{item.group}</div>
                <div className="text-white/30 text-xs">{item.label}</div>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${item.color}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────── SETTINGS SCREEN ──────── */
function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [toggles, setToggles] = useState({
    notifications: true,
    sounds: true,
    readReceipts: true,
    twoFactor: false,
    darkMode: true,
  });

  const toggle = (k: keyof typeof toggles) => setToggles(p => ({ ...p, [k]: !p[k] }));

  const groups = [
    {
      label: "Приватность",
      items: [
        { key: "readReceipts" as const, icon: "CheckCheck", label: "Статус прочтения", color: "text-green-400" },
        { key: "twoFactor" as const, icon: "Shield", label: "Двухфакторная аутентификация", color: "text-purple-400" },
      ]
    },
    {
      label: "Уведомления",
      items: [
        { key: "notifications" as const, icon: "Bell", label: "Push-уведомления", color: "text-cyan-400" },
        { key: "sounds" as const, icon: "Volume2", label: "Звуки сообщений", color: "text-orange-400" },
      ]
    },
    {
      label: "Внешний вид",
      items: [
        { key: "darkMode" as const, icon: "Moon", label: "Тёмная тема", color: "text-indigo-400" },
      ]
    },
  ];

  return (
    <div className="h-full flex flex-col screen">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl glass">
            <Icon name="ChevronLeft" size={20} className="text-white/70" />
          </button>
          <h1 className="font-display text-2xl font-bold text-white">Настройки</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
        {groups.map(group => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2 px-1">{group.label}</p>
            <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5">
              {group.items.map(item => (
                <div key={item.key} className="flex items-center gap-3 px-4 py-4">
                  <Icon name={item.icon} size={18} className={item.color} />
                  <span className="flex-1 text-white text-sm">{item.label}</span>
                  <button
                    onClick={() => toggle(item.key)}
                    className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 px-0.5 ${toggles[item.key] ? "toggle-on" : "toggle-off"}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${toggles[item.key] ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2 px-1">Аккаунт</p>
          <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5">
            {[
              { icon: "LogOut", label: "Выйти из аккаунта", color: "text-orange-400" },
              { icon: "Trash2", label: "Удалить аккаунт", color: "text-red-400" },
            ].map(item => (
              <button key={item.label} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/4 transition-all text-left">
                <Icon name={item.icon} size={18} className={item.color} />
                <span className={`text-sm ${item.color}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-white/15 text-xs pb-2">Pulse v1.0.0 · Made with 🚀</p>
      </div>
    </div>
  );
}

/* ──────── CREATE GROUP SCREEN ──────── */
const ROLE_CONFIG: Record<MemberRole, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  admin: { label: "Администратор", color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30", icon: "Shield", desc: "Полный доступ" },
  moderator: { label: "Модератор", color: "text-cyan-400", bg: "bg-cyan-500/15 border-cyan-500/30", icon: "Star", desc: "Управление участниками" },
  member: { label: "Участник", color: "text-white/60", bg: "bg-white/5 border-white/10", icon: "User", desc: "Чтение и отправка" },
};

function CreateGroupScreen({ contacts, onBack, onCreate }: {
  contacts: Contact[];
  onBack: () => void;
  onCreate: (name: string, members: GroupMember[]) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [editingRole, setEditingRole] = useState<number | null>(null);

  const toggleContact = (contact: Contact) => {
    setMembers(prev => {
      const exists = prev.find(m => m.contact.id === contact.id);
      if (exists) return prev.filter(m => m.contact.id !== contact.id);
      return [...prev, { contact, role: "member" }];
    });
  };

  const setRole = (contactId: number, role: MemberRole) => {
    setMembers(prev => prev.map(m => m.contact.id === contactId ? { ...m, role } : m));
    setEditingRole(null);
  };

  const isSelected = (id: number) => members.some(m => m.contact.id === id);

  const canNext1 = groupName.trim().length >= 2;
  const canNext2 = members.length >= 1;

  return (
    <div className="h-full flex flex-col screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={step === 1 ? onBack : () => setStep(s => (s - 1) as 1 | 2 | 3)}
            className="w-9 h-9 flex items-center justify-center rounded-xl glass">
            <Icon name="ChevronLeft" size={20} className="text-white/70" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-white">Новая группа</h1>
            <p className="text-white/30 text-xs">Шаг {step} из 3</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s
              ? "opacity-100"
              : "opacity-20 bg-white/20"
              }`}
              style={step >= s ? { background: "linear-gradient(135deg,#a855f7,#6366f1)" } : {}} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">

        {/* ── Step 1: Group info ── */}
        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <p className="text-white/50 text-sm mb-6">Введите название и описание группы</p>

            {/* Avatar picker */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-24 h-24 rounded-3xl avatar-grad-2 flex items-center justify-center relative glow-purple">
                <Icon name="Users" size={36} className="text-white/90" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}>
                  <Icon name="Camera" size={14} className="text-white" />
                </div>
              </div>
              <p className="text-white/30 text-xs">Нажмите для смены фото</p>
            </div>

            <div className="space-y-3">
              <div className="glass rounded-2xl px-4 py-1 flex items-center gap-3">
                <Icon name="Hash" size={16} className="text-purple-400 flex-shrink-0" />
                <input
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="Название группы*"
                  maxLength={50}
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/25 outline-none py-3"
                />
                <span className="text-white/20 text-xs">{groupName.length}/50</span>
              </div>

              <div className="glass rounded-2xl px-4 py-1 flex items-start gap-3">
                <Icon name="AlignLeft" size={16} className="text-cyan-400 flex-shrink-0 mt-3.5" />
                <textarea
                  value={groupDesc}
                  onChange={e => setGroupDesc(e.target.value)}
                  placeholder="Описание группы (необязательно)"
                  rows={3}
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/25 outline-none py-3 resize-none"
                />
              </div>
            </div>

            {/* Group type */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Тип группы</p>
              <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5">
                {[
                  { icon: "Globe", label: "Публичная", desc: "Любой может найти и вступить", color: "text-green-400" },
                  { icon: "Lock", label: "Приватная", desc: "Только по приглашению", color: "text-orange-400" },
                ].map((t, i) => (
                  <label key={t.label} className="flex items-center gap-3 px-4 py-4 cursor-pointer">
                    <Icon name={t.icon} size={18} className={t.color} />
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{t.label}</div>
                      <div className="text-white/30 text-xs">{t.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${i === 1 ? "border-purple-400" : "border-white/20"}`}>
                      {i === 1 && <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Add members ── */}
        {step === 2 && (
          <div className="animate-slide-up">
            <p className="text-white/50 text-sm mb-4">Выберите участников группы</p>

            {members.length > 0 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {members.map(m => (
                  <div key={m.contact.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl ${m.contact.avatar} flex items-center justify-center text-white font-bold text-sm`}>
                        {m.contact.name.charAt(0)}
                      </div>
                      <button onClick={() => toggleContact(m.contact)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <Icon name="X" size={10} className="text-white" />
                      </button>
                    </div>
                    <span className="text-white/50 text-[10px] w-12 text-center truncate">{m.contact.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1">
              {contacts.map(contact => (
                <button key={contact.id} onClick={() => toggleContact(contact)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left ${isSelected(contact.id) ? "glass border border-purple-500/20" : "hover:bg-white/4"}`}>
                  <div className="relative flex-shrink-0">
                    <div className={`w-11 h-11 rounded-xl ${contact.avatar} flex items-center justify-center text-white font-bold`}>
                      {contact.name.charAt(0)}
                    </div>
                    {contact.online && <div className="absolute -bottom-0.5 -right-0.5 online-dot" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{contact.name}</div>
                    <div className="text-white/40 text-xs">{contact.status}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected(contact.id) ? "border-transparent" : "border-white/20"}`}
                    style={isSelected(contact.id) ? { background: "linear-gradient(135deg,#a855f7,#6366f1)" } : {}}>
                    {isSelected(contact.id) && <Icon name="Check" size={12} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Assign roles ── */}
        {step === 3 && (
          <div className="animate-slide-up space-y-4">
            <p className="text-white/50 text-sm">Назначьте роли участникам группы</p>

            {/* Role legend */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(Object.entries(ROLE_CONFIG) as [MemberRole, typeof ROLE_CONFIG[MemberRole]][]).map(([role, cfg]) => (
                <div key={role} className={`rounded-2xl p-3 border ${cfg.bg} text-center`}>
                  <Icon name={cfg.icon} size={16} className={`${cfg.color} mx-auto mb-1`} />
                  <div className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</div>
                  <div className="text-white/30 text-[10px] mt-0.5">{cfg.desc}</div>
                </div>
              ))}
            </div>

            {/* Member list with role picker */}
            <div className="space-y-2">
              {members.map(m => {
                const cfg = ROLE_CONFIG[m.role];
                return (
                  <div key={m.contact.id} className="glass rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-10 h-10 rounded-xl ${m.contact.avatar} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {m.contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm">{m.contact.name}</div>
                        <div className="text-white/30 text-xs">{m.contact.status}</div>
                      </div>
                      <button
                        onClick={() => setEditingRole(editingRole === m.contact.id ? null : m.contact.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${cfg.bg} ${cfg.color}`}
                      >
                        <Icon name={cfg.icon} size={12} className={cfg.color} />
                        {cfg.label}
                        <Icon name={editingRole === m.contact.id ? "ChevronUp" : "ChevronDown"} size={12} className={cfg.color} />
                      </button>
                    </div>

                    {/* Role dropdown */}
                    {editingRole === m.contact.id && (
                      <div className="border-t border-white/5 divide-y divide-white/5 animate-slide-up">
                        {(Object.entries(ROLE_CONFIG) as [MemberRole, typeof ROLE_CONFIG[MemberRole]][]).map(([role, rcfg]) => (
                          <button key={role} onClick={() => setRole(m.contact.id, role)}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${m.role === role ? "bg-white/5" : "hover:bg-white/3"}`}>
                            <Icon name={rcfg.icon} size={15} className={rcfg.color} />
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${rcfg.color}`}>{rcfg.label}</div>
                              <div className="text-white/30 text-xs">{rcfg.desc}</div>
                            </div>
                            {m.role === role && <Icon name="Check" size={14} className="text-purple-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="glass rounded-2xl px-4 py-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Users" size={16} className="text-purple-400" />
                <span className="text-white font-semibold text-sm">«{groupName}»</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {(["admin", "moderator", "member"] as MemberRole[]).map(role => {
                  const count = members.filter(m => m.role === role).length;
                  const cfg = ROLE_CONFIG[role];
                  return (
                    <div key={role}>
                      <div className={`text-lg font-bold ${cfg.color}`}>{count}</div>
                      <div className="text-white/30 text-xs">{cfg.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="px-5 pb-8 pt-3">
        {step < 3 ? (
          <button
            onClick={() => setStep(s => (s + 1) as 1 | 2 | 3)}
            disabled={step === 1 ? !canNext1 : !canNext2}
            className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-30"
            style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}
          >
            {step === 1 ? "Выбрать участников" : `Назначить роли (${members.length})`}
          </button>
        ) : (
          <button
            onClick={() => onCreate(groupName, members)}
            className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all active:scale-95 glow-purple"
            style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}
          >
            Создать группу 🚀
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────── GROUP SETTINGS SCREEN ──────── */
function GroupSettingsScreen({ chat, members, onBack, onUpdateMembers, onUpdateChat }: {
  chat: Chat;
  members: GroupMember[];
  onBack: () => void;
  onUpdateMembers: (m: GroupMember[]) => void;
  onUpdateChat: (c: Chat) => void;
}) {
  const [activeTab, setActiveTab] = useState<"members" | "settings" | "permissions">("members");
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [kickConfirm, setKickConfirm] = useState<number | null>(null);
  const [groupName, setGroupName] = useState(chat.name);
  const [perms, setPerms] = useState({
    membersCanInvite: true,
    membersCanEdit: false,
    membersCanPin: false,
    onlyAdminsPost: false,
    slowMode: false,
  });

  const togglePerm = (k: keyof typeof perms) => setPerms(p => ({ ...p, [k]: !p[k] }));

  const setRole = (contactId: number, role: MemberRole) => {
    onUpdateMembers(members.map(m => m.contact.id === contactId ? { ...m, role } : m));
    setEditingRole(null);
  };

  const kickMember = (contactId: number) => {
    onUpdateMembers(members.filter(m => m.contact.id !== contactId));
    setKickConfirm(null);
    const newCount = (chat.members ?? 1) - 1;
    onUpdateChat({ ...chat, members: newCount });
  };

  const saveGroupName = () => {
    if (groupName.trim().length >= 2) {
      onUpdateChat({ ...chat, name: groupName.trim() });
    }
  };

  const admins = members.filter(m => m.role === "admin");
  const mods = members.filter(m => m.role === "moderator");
  const regular = members.filter(m => m.role === "member");

  const TABS = [
    { id: "members" as const, icon: "Users", label: "Участники" },
    { id: "permissions" as const, icon: "Shield", label: "Права" },
    { id: "settings" as const, icon: "Settings2", label: "Группа" },
  ];

  return (
    <div className="h-full flex flex-col screen">
      {/* Header */}
      <div className="glass border-b border-white/5 px-5 pt-12 pb-0">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl glass">
            <Icon name="ChevronLeft" size={20} className="text-white/70" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-white">Настройки группы</h1>
            <p className="text-white/30 text-xs">{chat.name} · {members.length} участников</p>
          </div>
        </div>
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${activeTab === tab.id
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-white/30"
                }`}
            >
              <Icon name={tab.icon} size={14} className={activeTab === tab.id ? "text-purple-400" : "text-white/30"} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">

        {/* ── MEMBERS TAB ── */}
        {activeTab === "members" && (
          <div className="px-4 pt-4 space-y-4 animate-slide-up">
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: admins.length, label: "Администрат.", color: "text-purple-400", bg: "bg-purple-500/10" },
                { count: mods.length, label: "Модераторы", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                { count: regular.length, label: "Участники", color: "text-white/60", bg: "bg-white/5" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
                  <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
                  <div className="text-white/30 text-[10px]">{s.label}</div>
                </div>
              ))}
            </div>

            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-dashed border-purple-500/30 hover:border-purple-500/60 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.2),rgba(99,102,241,0.2))" }}>
                <Icon name="UserPlus" size={18} className="text-purple-400" />
              </div>
              <span className="text-purple-400 text-sm font-medium">Добавить участника</span>
            </button>

            {[
              { role: "admin" as MemberRole, list: admins },
              { role: "moderator" as MemberRole, list: mods },
              { role: "member" as MemberRole, list: regular },
            ].filter(g => g.list.length > 0).map(group => {
              const cfg = ROLE_CONFIG[group.role];
              return (
                <div key={group.role}>
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <Icon name={cfg.icon} size={13} className={cfg.color} />
                    <p className={`text-xs font-semibold uppercase tracking-wider ${cfg.color}`}>
                      {cfg.label} · {group.list.length}
                    </p>
                  </div>
                  <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5">
                    {group.list.map(m => (
                      <div key={m.contact.id}>
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="relative flex-shrink-0">
                            <div className={`w-10 h-10 rounded-xl ${m.contact.avatar} flex items-center justify-center text-white font-bold text-sm`}>
                              {m.contact.name.charAt(0)}
                            </div>
                            {m.contact.online && <div className="absolute -bottom-0.5 -right-0.5 online-dot" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-semibold">{m.contact.name}</div>
                            <div className="text-white/30 text-xs">{m.contact.status}</div>
                          </div>
                          <button
                            onClick={() => setEditingRole(editingRole === m.contact.id ? null : m.contact.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-medium transition-all ${cfg.bg} ${cfg.color}`}
                          >
                            <Icon name={cfg.icon} size={11} className={cfg.color} />
                            {cfg.label}
                            <Icon name={editingRole === m.contact.id ? "ChevronUp" : "ChevronDown"} size={11} className={cfg.color} />
                          </button>
                          <button
                            onClick={() => setKickConfirm(kickConfirm === m.contact.id ? null : m.contact.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-all ml-1"
                          >
                            <Icon name="UserMinus" size={14} className="text-red-400" />
                          </button>
                        </div>

                        {kickConfirm === m.contact.id && (
                          <div className="px-4 py-3 bg-red-500/5 border-t border-red-500/10 flex items-center gap-3 animate-slide-up">
                            <Icon name="AlertTriangle" size={16} className="text-red-400 flex-shrink-0" />
                            <span className="text-red-300 text-xs flex-1">Исключить {m.contact.name.split(" ")[0]}?</span>
                            <button onClick={() => setKickConfirm(null)} className="text-white/40 text-xs px-2 py-1">Нет</button>
                            <button onClick={() => kickMember(m.contact.id)}
                              className="text-white text-xs px-3 py-1 rounded-lg bg-red-500/80">Да</button>
                          </div>
                        )}

                        {editingRole === m.contact.id && (
                          <div className="border-t border-white/5 divide-y divide-white/5 animate-slide-up">
                            {(Object.entries(ROLE_CONFIG) as [MemberRole, typeof ROLE_CONFIG[MemberRole]][]).map(([role, rcfg]) => (
                              <button key={role} onClick={() => setRole(m.contact.id, role)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${m.role === role ? "bg-white/5" : "hover:bg-white/3"}`}>
                                <Icon name={rcfg.icon} size={15} className={rcfg.color} />
                                <div className="flex-1">
                                  <div className={`text-sm font-medium ${rcfg.color}`}>{rcfg.label}</div>
                                  <div className="text-white/30 text-xs">{rcfg.desc}</div>
                                </div>
                                {m.role === role && <Icon name="Check" size={14} className="text-purple-400" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PERMISSIONS TAB ── */}
        {activeTab === "permissions" && (
          <div className="px-4 pt-4 space-y-3 animate-slide-up">
            <p className="text-white/40 text-sm px-1">Что могут делать обычные участники</p>
            {[
              { key: "membersCanInvite" as const, icon: "UserPlus", label: "Приглашать новых участников", color: "text-green-400" },
              { key: "membersCanEdit" as const, icon: "Edit2", label: "Редактировать информацию группы", color: "text-cyan-400" },
              { key: "membersCanPin" as const, icon: "Pin", label: "Закреплять сообщения", color: "text-orange-400" },
              { key: "onlyAdminsPost" as const, icon: "MessageSquare", label: "Только администраторы пишут", color: "text-purple-400" },
              { key: "slowMode" as const, icon: "Clock", label: "Медленный режим (1 сообщ/мин)", color: "text-pink-400" },
            ].map(item => (
              <div key={item.key} className="glass rounded-2xl flex items-center gap-3 px-4 py-4">
                <Icon name={item.icon} size={18} className={item.color} />
                <span className="flex-1 text-white text-sm">{item.label}</span>
                <button
                  onClick={() => togglePerm(item.key)}
                  className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 px-0.5 ${perms[item.key] ? "toggle-on" : "toggle-off"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${perms[item.key] ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
            ))}

            <div className="glass rounded-2xl p-4 border border-purple-500/15 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Shield" size={16} className="text-purple-400" />
                <span className="text-white text-sm font-semibold">Права администраторов</span>
              </div>
              <div className="space-y-2">
                {["Удалять и редактировать сообщения", "Исключать участников", "Блокировать пользователей", "Добавлять новых администраторов"].map(right => (
                  <div key={right} className="flex items-center gap-2">
                    <Icon name="Check" size={13} className="text-purple-400 flex-shrink-0" />
                    <span className="text-white/50 text-xs">{right}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <div className="px-4 pt-4 space-y-4 animate-slide-up">
            <div className="flex items-center gap-4 glass rounded-2xl px-4 py-4">
              <div className={`w-16 h-16 rounded-2xl ${chat.avatar} flex items-center justify-center relative flex-shrink-0`}>
                <Icon name="Users" size={26} className="text-white/90" />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}>
                  <Icon name="Camera" size={13} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">{chat.name}</div>
                <div className="text-white/30 text-xs mt-0.5">{members.length} участников</div>
                <button className="text-purple-400 text-xs mt-1">Изменить фото</button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2 px-1">Название</p>
              <div className="glass rounded-2xl px-4 py-1 flex items-center gap-3">
                <Icon name="Hash" size={16} className="text-purple-400 flex-shrink-0" />
                <input
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  onBlur={saveGroupName}
                  className="flex-1 bg-transparent text-white text-sm outline-none py-3"
                />
                <button onClick={saveGroupName}>
                  <Icon name="Check" size={16} className="text-purple-400" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2 px-1">Ссылка-приглашение</p>
              <div className="glass rounded-2xl px-4 py-3.5 flex items-center gap-3">
                <Icon name="Link" size={16} className="text-cyan-400" />
                <span className="flex-1 text-white/60 text-sm">pulse.app/join/abc123</span>
                <button className="text-purple-400 text-xs font-medium">Скопировать</button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2 px-1">Опасная зона</p>
              <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5">
                <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/4 transition-all text-left">
                  <Icon name="Archive" size={18} className="text-orange-400" />
                  <span className="text-orange-400 text-sm">Архивировать группу</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-500/5 transition-all text-left">
                  <Icon name="Trash2" size={18} className="text-red-400" />
                  <span className="text-red-400 text-sm">Удалить группу</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────── CALL SCREEN ──────── */
function CallScreen({ chat, isVideo, onEnd }: {
  chat: Chat;
  isVideo: boolean;
  onEnd: () => void;
}) {
  const [callState, setCallState] = useState<CallState>("calling");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [videoOn, setVideoOn] = useState(isVideo);

  useEffect(() => {
    const connectTimer = setTimeout(() => setCallState("connected"), 3000);
    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (callState !== "connected") return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleEnd = () => {
    setCallState("ended");
    setTimeout(onEnd, 800);
  };

  return (
    <div className="h-full flex flex-col call-bg relative overflow-hidden screen">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-25 animate-orb"
          style={{ background: "radial-gradient(circle, #a855f7, transparent 65%)" }} />
        <div className="absolute bottom-0 right-[-60px] w-72 h-72 rounded-full opacity-20 animate-orb"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 65%)", animationDelay: "4s" }} />
        {isVideo && (
          <div className="absolute inset-0 opacity-10"
            style={{ background: "linear-gradient(135deg, #0f0b1e, #1a1040, #0d1a2e)" }} />
        )}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-4">
        <button onClick={onEnd} className="w-9 h-9 rounded-xl glass flex items-center justify-center">
          <Icon name="ChevronDown" size={20} className="text-white/60" />
        </button>
        <div className="text-center">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">
            {isVideo ? "Видеозвонок" : "Голосовой звонок"}
          </p>
        </div>
        <button className="w-9 h-9 rounded-xl glass flex items-center justify-center">
          <Icon name="MoreHorizontal" size={18} className="text-white/60" />
        </button>
      </div>

      {/* Avatar + status */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6">
        {/* Pulse rings */}
        <div className="relative flex items-center justify-center">
          {callState === "calling" && (
            <>
              <div className="absolute w-32 h-32 rounded-full animate-call-ring-1"
                style={{ background: "rgba(168,85,247,0.15)" }} />
              <div className="absolute w-32 h-32 rounded-full animate-call-ring-2"
                style={{ background: "rgba(168,85,247,0.12)" }} />
              <div className="absolute w-32 h-32 rounded-full animate-call-ring-3"
                style={{ background: "rgba(168,85,247,0.08)" }} />
            </>
          )}
          {callState === "connected" && (
            <>
              <div className="absolute w-32 h-32 rounded-full animate-pulse-ring" />
            </>
          )}

          {/* Avatar */}
          <div className={`w-32 h-32 rounded-[2.5rem] ${chat.avatar} flex items-center justify-center text-white text-5xl font-bold relative z-10`}
            style={{ boxShadow: "0 0 60px rgba(168,85,247,0.4), 0 0 120px rgba(168,85,247,0.15)" }}>
            {chat.isGroup
              ? <Icon name="Users" size={52} className="text-white/90" />
              : chat.name.charAt(0)
            }
          </div>
        </div>

        {/* Name & status */}
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-2">{chat.name}</h2>
          {callState === "calling" && (
            <div className="flex items-center gap-1.5 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-typing" style={{ animationDelay: "0s" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-typing" style={{ animationDelay: "0.2s" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-typing" style={{ animationDelay: "0.4s" }} />
              <span className="text-white/50 text-sm ml-1">Вызов...</span>
            </div>
          )}
          {callState === "connected" && (
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-mono font-medium">{formatTime(seconds)}</span>
            </div>
          )}
          {callState === "ended" && (
            <span className="text-red-400 text-sm">Звонок завершён</span>
          )}
        </div>

        {/* Secondary controls */}
        {callState === "connected" && (
          <div className="flex gap-4 mt-2">
            {[
              { icon: muted ? "MicOff" : "Mic", label: muted ? "Выкл" : "Микр.", active: !muted, action: () => setMuted(m => !m) },
              { icon: speakerOn ? "Volume2" : "VolumeX", label: "Динамик", active: speakerOn, action: () => setSpeakerOn(s => !s) },
              ...(isVideo ? [{ icon: videoOn ? "Video" : "VideoOff", label: "Камера", active: videoOn, action: () => setVideoOn(v => !v) }] : []),
              { icon: "MessageCircle", label: "Чат", active: false, action: onEnd },
            ].map(btn => (
              <button key={btn.icon} onClick={btn.action}
                className="flex flex-col items-center gap-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${btn.active
                  ? "bg-white/10 border border-white/15"
                  : "bg-white/5 border border-white/8"
                  }`}>
                  <Icon name={btn.icon} size={22} className={btn.active ? "text-white" : "text-white/30"} />
                </div>
                <span className={`text-xs ${btn.active ? "text-white/50" : "text-white/20"}`}>{btn.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Video preview placeholder */}
        {isVideo && videoOn && callState === "connected" && (
          <div className="w-28 h-40 rounded-2xl overflow-hidden border border-white/10 absolute bottom-44 right-6"
            style={{ background: "linear-gradient(135deg,#1e1040,#0d1a2e)" }}>
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Icon name="Video" size={24} className="text-white/20 mx-auto mb-1" />
                <span className="text-white/20 text-[10px]">Камера</span>
              </div>
            </div>
            <div className="absolute bottom-2 right-2">
              <button onClick={() => setVideoOn(false)} className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center">
                <Icon name="VideoOff" size={13} className="text-white/60" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main action buttons */}
      <div className="relative z-10 px-8 pb-16">
        {callState === "calling" ? (
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleEnd}
                className="w-18 h-18 w-[72px] h-[72px] rounded-full call-btn-end flex items-center justify-center transition-transform active:scale-90">
                <Icon name="PhoneOff" size={28} className="text-white" />
              </button>
              <span className="text-white/40 text-xs">Отклонить</span>
            </div>
          </div>
        ) : callState === "connected" ? (
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleEnd}
                className="w-[72px] h-[72px] rounded-full call-btn-end flex items-center justify-center transition-transform active:scale-90">
                <Icon name="PhoneOff" size={28} className="text-white" />
              </button>
              <span className="text-white/40 text-xs">Завершить</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="text-white/30 text-sm">Закрытие...</span>
          </div>
        )}
      </div>
    </div>
  );
}