import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { getPublishedMachines, uploadMachineVideo } from "../lib/machines";


import {
  Accessibility,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  Download,
  Eye,
  Hand,
  History,
  Languages,
  LayoutDashboard,
  Library,
  Menu,
  Play,
  Plus,
  QrCode,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { createQrData, downloadDataUrl, downloadSvg, slugify } from "@/lib/qr";
import { getProfile, supabase, supabaseConfigured } from "@/lib/supabase";

type Machine = {
  id: string;
  name: string;
  slug?: string;
  subtitle: string;
  category: string;
  duration: string;
  views: string;
  accent: string;
  visual: "press" | "laser" | "robot" | "compressor";
  featured?: boolean;
  description: string;
  steps: string[];
  videoUrl?: string;
};

const seedMachines: Machine[] = [
  {
    id: "press-001",
    name: "Prensa hidráulica H-400",
    subtitle: "Operação segura e manutenção básica",
    category: "Produção",
    duration: "04:32",
    views: "1,2 mil",
    accent: "lime",
    visual: "press",
    featured: true,
    description:
      "Aprenda a identificar o painel, iniciar um ciclo e realizar a parada segura da prensa hidráulica H-400.",
    steps: ["Confira o botão de emergência", "Posicione o material na base", "Inicie o ciclo pelo painel frontal"],
  },
  {
    id: "laser-014",
    name: "Cortadora a laser L-20",
    subtitle: "Configuração inicial do painel",
    category: "Corte",
    duration: "06:18",
    views: "846",
    accent: "coral",
    visual: "laser",
    description:
      "Veja em Libras como carregar o arquivo, ajustar o foco e conferir a área de corte antes de iniciar.",
    steps: ["Abra o arquivo correto", "Ajuste o foco do cabeçote", "Faça o teste de contorno"],
  },
  {
    id: "robot-022",
    name: "Braço robótico R-7",
    subtitle: "Modo manual e área de segurança",
    category: "Automação",
    duration: "08:05",
    views: "692",
    accent: "blue",
    visual: "robot",
    description:
      "Uma introdução visual ao modo manual, à habilitação do robô e aos limites da área de segurança.",
    steps: ["Faça a inspeção visual", "Habilite o modo manual", "Mantenha a área isolada"],
  },
  {
    id: "compressor-009",
    name: "Compressor C-12",
    subtitle: "Ligação, pressão e desligamento",
    category: "Utilidades",
    duration: "03:47",
    views: "431",
    accent: "violet",
    visual: "compressor",
    description:
      "Entenda os indicadores do compressor e a sequência correta para ligar e desligar o equipamento.",
    steps: ["Cheque o nível de pressão", "Abra a válvula de saída", "Desligue pelo painel"],
  },
];

const qrPattern = [
  "11111110010111111",
  "10000010110110001",
  "10111010000110101",
  "10111011101110101",
  "10111010011010101",
  "10000011101010001",
  "11111110101011111",
  "00000000110100000",
  "11001110101110110",
  "10110001100101101",
  "01101111011011010",
  "11010100101100111",
  "00111011110010100",
  "10101100101111011",
  "11111110110001010",
  "10000011101110101",
  "11111110110101111",
];

function QrMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "qr-mark qr-mark--compact" : "qr-mark"} aria-label="QR Code demonstrativo">
      <div className="qr-grid" aria-hidden="true">
        {qrPattern.flatMap((row, rowIndex) =>
          row.split("").map((cell, cellIndex) => (
            <span key={`${rowIndex}-${cellIndex}`} className={cell === "1" ? "qr-cell qr-cell--on" : "qr-cell"} />
          )),
        )}
      </div>
    </div>
  );
}

function RealQrPreview({ name, savedSlug }: { name: string; savedSlug: string }) {
  const [qr, setQr] = useState<{ url: string; svg: string; png: string } | null>(null);
  const slug = savedSlug || slugify(name || "meclibras-demo");

  useEffect(() => {
    createQrData(slug).then(setQr).catch(() => setQr(null));
  }, [slug]);

  return (
    <>
      <div className="qr-preview qr-preview--real">{qr ? <img src={qr.png} alt={`QR Code para ${slug}`} /> : <QrMark />}</div>
      <div className="qr-preview-id"><span>URL PÚBLICA</span><strong>{qr?.url ?? `/${slug}`}</strong></div>
      <div className="qr-download-actions">
        <button className="small-outline" type="button" disabled={!qr} onClick={() => qr && downloadSvg(qr.svg, `${slug}-qr.svg`)}><Download size={14} /> SVG impressão</button>
        <button className="small-outline" type="button" disabled={!qr} onClick={() => qr && downloadDataUrl(qr.png, `${slug}-qr.png`)}><Download size={14} /> PNG</button>
      </div>
    </>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 44 44" role="presentation">
        <circle cx="22" cy="22" r="16" className="brand-mark__gear" />
        <path d="M15 23.5c2.4-2.2 4.5-3.2 6.3-3.2 2.3 0 3.2 1.6 4.8 1.6 1.1 0 2.2-.6 3.9-2" className="brand-mark__hand" />
        <path d="M20.7 20.3v-6.1m3.1 6.2v-7m3.1 7.7v-5.6" className="brand-mark__fingers" />
      </svg>
    </span>
  );
}

function MachineVisual({ machine, large = false }: { machine: Machine; large?: boolean }) {
  return (
    <div className={`machine-visual machine-visual--${machine.accent} ${large ? "machine-visual--large" : ""}`}>
      <div className="visual-noise" />
      <div className="visual-topline">
        <span>{machine.category.toUpperCase()}</span>
        <span className="visual-status"><span /> AO VIVO</span>
      </div>
      <div className={`machine-shape machine-shape--${machine.visual}`}>
        <div className="machine-shape__screen"><span>READY</span></div>
        <div className="machine-shape__body" />
        <div className="machine-shape__arm" />
        <div className="machine-shape__base" />
        <div className="machine-shape__spark" />
      </div>
      <div className="visual-label">
        <span>{machine.name}</span>
        <span className="visual-arrow"><ArrowUpRight size={15} /></span>
      </div>
    </div>
  );
}

function QrScannerPanel({ onScan }: { onScan: () => void }) {
  return (
    <div className="scanner-card">
      <div className="scanner-card__glow" />
      <div className="scanner-card__top">
        <span className="eyebrow eyebrow--light"><span className="eyebrow-dot" /> EXPERIÊNCIA QR</span>
        <QrCode size={19} />
      </div>
      <div className="scanner-card__content">
        <div className="scanner-phone">
          <div className="scanner-phone__notch" />
          <div className="scanner-phone__screen">
            <div className="scanner-corner scanner-corner--tl" />
            <div className="scanner-corner scanner-corner--tr" />
            <div className="scanner-corner scanner-corner--bl" />
            <div className="scanner-corner scanner-corner--br" />
            <QrMark compact />
            <div className="scanner-line" />
            <span className="scanner-phone__hint">Aponte para o QR da máquina</span>
          </div>
        </div>
        <div className="scanner-copy">
          <p className="scanner-number">01 <span>/</span> 03</p>
          <h2>Um jeito mais simples de aprender.</h2>
          <p>Escaneie. Assista em Libras. Volte quando precisar.</p>
          <button className="button button--lime button--wide" onClick={onScan}>
            <ScanIcon />
            Simular leitura do QR
          </button>
        </div>
      </div>
      <div className="scanner-card__footer">
        <span><ShieldCheck size={15} /> Sem login para assistir</span>
        <span><Languages size={15} /> Libras + legenda</span>
      </div>
    </div>
  );
}

function ScanIcon() {
  return <span className="scan-icon"><span /><span /><span /><span /></span>;
}

function MachineCard({ machine, onOpen }: { machine: Machine; onOpen: (machine: Machine) => void }) {
  return (
    <article className={`machine-card ${machine.featured ? "machine-card--featured" : ""}`}>
      <button className="machine-card__visual-button" onClick={() => onOpen(machine)} aria-label={`Abrir vídeo de ${machine.name}`}>
        <MachineVisual machine={machine} />
        <span className="play-bubble"><Play size={16} fill="currentColor" /></span>
      </button>
      <div className="machine-card__body">
        <div className="machine-card__meta"><span>{machine.category}</span><span>•</span><span>{machine.duration}</span></div>
        <h3>{machine.name}</h3>
        <p>{machine.subtitle}</p>
        <div className="machine-card__bottom">
          <span className="view-count"><Eye size={14} /> {machine.views} visualizações</span>
          <button className="icon-link" onClick={() => onOpen(machine)} aria-label={`Ver ${machine.name}`}><ArrowUpRight size={18} /></button>
        </div>
      </div>
    </article>
  );
}

function VideoPlayer({ machine }: { machine: Machine }) {
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(true);
  return (
    <div className={`video-player video-player--${machine.accent}`}>
      {machine.videoUrl ? (
        <video className="machine-video-real" controls playsInline preload="metadata" src={machine.videoUrl}>
          Seu navegador não suporta a reprodução de vídeos.
        </video>
      ) : null}
      {!machine.videoUrl && <>
      <div className="video-player__ambient" />
      <div className="video-player__grid" />
      <div className="video-player__topbar"><span className="video-live-dot" /> VÍDEO EM LIBRAS <span>·</span> {machine.duration}</div>
      <div className="video-player__figure">
        <div className="signer-head" />
        <div className="signer-body" />
        <div className="signer-hand signer-hand--left" />
        <div className="signer-hand signer-hand--right" />
        <div className="signer-caption">Olá! Neste vídeo você vai aprender a operar esta máquina com segurança.</div>
      </div>
      <div className="video-player__center">
        <button className="video-play" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}>
          {playing ? <span className="pause-bars"><i /><i /></span> : <Play size={28} fill="currentColor" />}
        </button>
        <span>{playing ? "Reproduzindo demonstração" : "Assistir demonstração"}</span>
      </div>
      <div className="video-player__controls">
        <button onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pausar" : "Reproduzir"}>{playing ? <span className="pause-bars pause-bars--small"><i /><i /></span> : <Play size={15} fill="currentColor" />}</button>
        <div className="video-progress"><span style={{ width: playing ? "34%" : "8%" }} /></div>
        <span>00:48 / {machine.duration}</span>
        <button onClick={() => setCaptions((value) => !value)} className={captions ? "control-active" : ""} aria-label="Alternar legendas">CC</button>
        <button aria-label="Volume"><Volume2 size={15} /></button>
      </div>
      </>}
    </div>
  );
}

function HistoryCard({ machine, onOpen }: { machine: Machine; onOpen: (machine: Machine) => void }) {
  return (
    <button className="history-card" onClick={() => onOpen(machine)}>
      <div className="history-card__thumb"><MachineVisual machine={machine} /></div>
      <div className="history-card__info"><span className="eyebrow">VISTO RECENTEMENTE</span><h3>{machine.name}</h3><p>{machine.subtitle}</p><div className="history-card__progress"><span style={{ width: "62%" }} /></div><span className="history-card__time">Você parou em 02:48 · continuar</span></div>
      <ChevronRight size={19} />
    </button>
  );
}

function AdminLogin({ onLogin, onBack }: { onLogin: (mode: "admin" | "user", email: string, password: string) => void; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"admin" | "user">("admin");
  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon"><ShieldCheck size={24} /></div>
        <div className="eyebrow"><span className="eyebrow-dot" /> {mode === "admin" ? "ÁREA RESTRITA" : "CONTA DE APRENDIZADO"}</div>
        <div className="login-mode-switch"><button type="button" className={mode === "admin" ? "login-mode-switch__active" : ""} onClick={() => setMode("admin")}>Administrador</button><button type="button" className={mode === "user" ? "login-mode-switch__active" : ""} onClick={() => setMode("user")}>Usuário</button></div>
        <h1>{mode === "admin" ? <>Entre para gerenciar<br /><em>seus QRs.</em></> : <>Continue seu<br /><em>aprendizado.</em></>}</h1>
        <p>{mode === "admin" ? "Somente administradores cadastram máquinas, associam vídeos e geram novas etiquetas." : "Crie uma conta para rever vídeos, salvar máquinas e acompanhar seu histórico."}</p>
        <form onSubmit={(event) => { event.preventDefault(); onLogin(mode, email, password); }}>
          <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@empresa.com" required /></label>
          <label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required /></label>
          <button className="button button--dark button--wide" type="submit"><ShieldCheck size={16} /> Entrar no painel</button>
        </form>
        <div className="login-demo-note"><Zap size={16} /><span>{supabaseConfigured ? "Login conectado ao Supabase." : "Modo demo: configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar o login online."}</span></div>
        <button className="back-link back-link--center" onClick={onBack}><ArrowLeft size={15} /> Voltar para a área pública</button>
      </div>
    </main>
  );
}

export default function Home() {

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [activeTab, setActiveTab] = useState<"explore" | "history" | "admin">("explore");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [history, setHistory] = useState<string[]>(["press-001", "laser-014"]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [userAuthed, setUserAuthed] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [form, setForm] = useState({ name: "", category: "Produção", subtitle: "", duration: "" });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("maquina-acessivel-history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      // O protótipo segue funcionando mesmo sem localStorage.
    }
  }, []);
  useEffect(() => {
    async function loadMachines() {
      try {
        const data = await getPublishedMachines();
        const convertedMachines: Machine[] = data.map((machine) => ({
          id: machine.id,
          name: machine.name,
          slug: machine.slug,
          subtitle: machine.description ?? "",
          category: machine.item_type ?? "Máquina",
          duration: "—",
          views: "0",
          accent: "#FF8903",
          visual: "press",
          featured: false,
          description: machine.description ?? "",
          steps:
            typeof machine.instructions === "string"
              ? machine.instructions
                .split("\n")
                .map((step) => step.trim())
                .filter(Boolean)
              : [],
          videoUrl: machine.video_url ?? "",
        }));


        setMachines(convertedMachines);
      } catch (error) {
        console.error("Erro ao carregar máquinas do Supabase:", error);

        // Mantém o protótipo funcionando caso o banco ainda esteja vazio
        // ou a conexão ainda não esteja disponível.
        setMachines(seedMachines);
      } finally {
        setLoadingMachines(false);
      }
    }

    loadMachines();
  }, []);
  const categories = [
    "Todos",
    ...Array.from(
      new Set(
        machines
          .map((machine) => machine.category)
          .filter(Boolean)
      )
    ),
  ];

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const matchesQuery =
        machine.name.toLowerCase().includes(query.toLowerCase()) ||
        machine.subtitle.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        category === "Todos" || machine.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [machines, query, category]);

  const historyMachines = history.map((id) => machines.find((machine) => machine.id === id)).filter(Boolean) as Machine[];

  const openMachine = (machine: Machine, announce = false) => {
    setSelectedMachine(machine);
    setHistory((current) => {
      const next = [machine.id, ...current.filter((id) => id !== machine.id)].slice(0, 6);
      localStorage.setItem("maquina-acessivel-history", JSON.stringify(next));
      return next;
    });
    if (announce) toast.success("QR reconhecido", { description: `${machine.name} está pronto para assistir em Libras.` });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitMachine = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.subtitle) {
      toast.error("Preencha o nome e a descrição curta da máquina.");
      return;
    }
    const generatedSlug = slugify(form.name);
    let uploadedVideoUrl = "";

    if (supabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Faça login como administrador antes de cadastrar.");
        return;
      }
      const { data: savedMachine, error } = await supabase.from("machines").insert({
        slug: generatedSlug,
        name: form.name,
        item_type: form.category,
        description: form.subtitle,
        status: "published",
        created_by: user.id,
      }).select("id, slug").single();
      if (error || !savedMachine) {
        toast.error("Não foi possível salvar no Supabase", { description: error?.message ?? "Registro não criado." });
        return;
      }

      if (videoFile) {
        try {
          const uploadedMachine = await uploadMachineVideo(generatedSlug, videoFile);
          uploadedVideoUrl = uploadedMachine.video_url ?? "";
        } catch (uploadError) {
          toast.error("Máquina criada, mas o vídeo não foi enviado", {
            description: uploadError instanceof Error ? uploadError.message : "Verifique o bucket videos-libras e suas políticas.",
          });
        }
      }
    }
    const newMachine: Machine = {
      id: generatedSlug,
      name: form.name,
      slug: generatedSlug,
      subtitle: form.subtitle,
      category: form.category,
      duration: form.duration || "03:00",
      views: "0",
      accent: "lime",
      visual: "press",
      description: `Vídeo introdutório em Libras sobre ${form.name}.`,
      steps: ["Apresente a máquina", "Explique os controles", "Mostre o procedimento seguro"],
      videoUrl: uploadedVideoUrl,
    };
    setMachines((current) => [newMachine, ...current]);
    setCreatedSlug(generatedSlug);
    setForm({ name: "", category: "Produção", subtitle: "", duration: "" });
    setVideoFile(null);
    toast.success("Máquina cadastrada", { description: supabaseConfigured ? "Salva no Supabase e pronta para receber o vídeo." : "Salva no modo demo. Configure o Supabase para persistir online." });
  };

  const handleLogin = async (mode: "admin" | "user", email: string, password: string) => {
    if (supabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        toast.error("Não foi possível entrar", { description: error?.message ?? "Verifique suas credenciais." });
        return;
      }
      if (mode === "admin") {
        const profile = await getProfile(data.user.id);
        if (profile?.role !== "admin") {
          await supabase.auth.signOut();
          toast.error("Esta conta não tem acesso de administrador.");
          return;
        }
        setAdminAuthed(true);
        toast.success("Login de administrador realizado");
      } else {
        setUserAuthed(true);
        setActiveTab("explore");
        toast.success("Login realizado", { description: "Seu histórico poderá ser sincronizado online." });
      }
      return;
    }
    if (mode === "admin") {
      setAdminAuthed(true);
      toast.success("Login demo de administrador realizado");
    } else {
      setUserAuthed(true);
      setActiveTab("explore");
      toast.success("Login demo de usuário realizado");
    }
  };

  const navigateTo = (tab: "explore" | "history" | "admin") => {
    setSelectedMachine(null);
    setActiveTab(tab);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => navigateTo("explore")} aria-label="Ir para início"><BrandMark /><span>Mec<span className="brand-accent">Libras</span></span></button>
          <nav className={`main-nav ${mobileMenu ? "main-nav--open" : ""}`}>
            <button className={activeTab === "explore" && !selectedMachine ? "nav-link nav-link--active" : "nav-link"} onClick={() => navigateTo("explore")}><Library size={16} /> Explorar</button>
            <button className={activeTab === "history" && !selectedMachine ? "nav-link nav-link--active" : "nav-link"} onClick={() => navigateTo("history")}><History size={16} /> Meu histórico <span className="nav-count">{history.length}</span></button>
            <button className={activeTab === "admin" && !selectedMachine ? "nav-link nav-link--active" : "nav-link"} onClick={() => navigateTo("admin")}><LayoutDashboard size={16} /> Área do admin</button>
          </nav>
          <div className="header-actions"><button className="header-help" aria-label="Ajuda"><CircleHelp size={18} /></button><button className="avatar-button" aria-label="Perfil"><UserRound size={17} /></button><button className="mobile-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label="Abrir menu">{mobileMenu ? <X size={21} /> : <Menu size={21} />}</button></div>
        </div>
      </header>

      {selectedMachine ? (
        <main className="detail-page">
          <div className="container">
            <button className="back-link" onClick={() => setSelectedMachine(null)}><ArrowLeft size={16} /> Voltar para explorar</button>
            <div className="detail-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> PÁGINA PÚBLICA DA MÁQUINA</div><h1>{selectedMachine.name}</h1><p>{selectedMachine.description}</p><div className="public-url"><QrCode size={14} /><span>
              {window.location.origin}/m/{selectedMachine.slug ?? selectedMachine.id}
            </span><strong>aberto pelo QR</strong></div></div><button className="outline-button" onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}/m/${selectedMachine.slug ?? selectedMachine.id}`
              ); toast.success("Link público copiado", { description: "Esse é o endereço que fica dentro do QR Code." });
            }}><Copy size={16} /> Copiar link do QR</button></div>
            <div className="detail-layout"><div><VideoPlayer machine={selectedMachine} /><div className="video-note"><BadgeCheck size={17} /><span>Vídeo revisado com consultoria em Libras</span><span className="note-separator">·</span><span>Legenda disponível</span></div></div><aside className="detail-aside"><div className="aside-label">SOBRE ESTE VÍDEO</div><h2>O essencial, sem complicar.</h2><p>{selectedMachine.subtitle}. O conteúdo foi pensado para consulta rápida no chão de fábrica.</p><div className="step-list">{selectedMachine.steps.map((step, index) => <div className="step-item" key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p><Check size={15} /></div>)}</div><button className="button button--dark button--wide" onClick={() => toast.success("Salvo no seu histórico", { description: "Você pode continuar de onde parou." })}><BookmarkIcon /> Salvar para rever depois</button></aside></div>
            <section className="related-section"><div className="section-heading"><div><div className="eyebrow">CONTINUE EXPLORANDO</div><h2>Outras máquinas</h2></div><button className="text-link" onClick={() => { setSelectedMachine(null); setActiveTab("explore"); }}>Ver todas <ArrowUpRight size={16} /></button></div><div className="machine-grid machine-grid--related">{machines.filter((machine) => machine.id !== selectedMachine.id).slice(0, 3).map((machine) => <MachineCard key={machine.id} machine={machine} onOpen={openMachine} />)}</div></section>
          </div>
        </main>
      ) : activeTab === "admin" && !adminAuthed ? (
        <AdminLogin onLogin={handleLogin} onBack={() => navigateTo("explore")} />
      ) : activeTab === "admin" ? (
        <main className="admin-page"><div className="container"><div className="page-intro"><div><div className="eyebrow"><span className="eyebrow-dot" /> PAINEL PRIVADO · ADMIN</div><h1>Cadastre uma nova máquina.</h1><p>Crie o perfil, associe o vídeo em Libras e gere um QR pronto para imprimir.</p></div><div className="intro-icon"><Settings2 size={25} /></div></div><div className="admin-flow-note"><div className="admin-flow-note__step admin-flow-note__step--active"><span>01</span><strong>Você cadastra</strong><small>máquina + vídeo</small></div><ChevronRight size={16} /><div className="admin-flow-note__step"><span>02</span><strong>O sistema gera</strong><small>URL pública + QR</small></div><ChevronRight size={16} /><div className="admin-flow-note__step"><span>03</span><strong>O usuário lê</strong><small>e abre o vídeo</small></div></div><div className="admin-layout"><form className="admin-form" onSubmit={submitMachine}><div className="form-section-title"><span>01</span><div><h2>Informações da máquina</h2><p>O que a pessoa verá ao escanear.</p></div></div><label>Nome da máquina<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Torno CNC T-30" /></label><label>Descrição curta<input value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} placeholder="Ex.: Primeiros passos e segurança" /></label><div className="form-row"><label>Categoria<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Produção</option><option>Corte</option><option>Automação</option><option>Utilidades</option><option>Manutenção</option></select></label><label>Duração do vídeo<input value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="04:30" /></label></div><div className="upload-box"><div className="upload-icon"><Play size={17} fill="currentColor" /></div><div><strong>Adicionar vídeo em Libras</strong><span>{videoFile ? videoFile.name : "MP4, até 500 MB"}</span></div><label className="small-outline upload-file-label">Selecionar arquivo<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} /></label></div><button className="button button--dark" type="submit"><Plus size={17} /> Cadastrar e gerar QR</button></form><div className="qr-preview-card"><div className="form-section-title"><span>02</span><div><h2>QR Code da máquina</h2><p>Baixe e imprima para colar na máquina.</p></div></div><RealQrPreview name={form.name} savedSlug={createdSlug} /><div className="qr-preview-note"><QrCode size={17} /><span>Este QR contém a URL pública desta máquina. Cada novo cadastro recebe um slug e QR diferente.</span></div></div></div></div></main>
      ) : (
        <main>
          {activeTab === "explore" && <section className="hero-section"><div className="container hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> MECÂNICA QUE INCLUI</div><h1>Aprenda a operar.<br /><em>Do seu jeito.</em></h1><p>Tutoriais em Libras para entender máquinas, trabalhar com segurança e revisar cada etapa quando precisar.</p><div className="hero-actions"><button className="button button--dark" onClick={() => openMachine(machines[0], true)}><QrCode size={17} /> Simular leitura do QR</button><button className="text-link text-link--hero" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>Como funciona <ArrowUpRight size={16} /></button></div><div className="hero-trust"><div className="avatar-stack"><span>AC</span><span>ML</span><span>+</span></div><span>Feito para aprender no ritmo da operação</span></div></div><QrScannerPanel onScan={() => openMachine(machines[0], true)} /></div></section>}
          {activeTab === "explore" && <section className="stats-strip"><div className="container stats-inner"><div><strong>04</strong><span>máquinas catalogadas</span></div><div><strong>100%</strong><span>conteúdo em Libras</span></div><div><strong>01</strong><span>QR para cada máquina</span></div><div className="stats-quote"><Sparkles size={17} /><span>“Acessibilidade é quando o conteúdo chega junto.”</span></div></div></section>}
          {activeTab === "explore" && (
            <section className="catalog-section">
              <div className="container">
                <div className="section-heading section-heading--catalog">
                  <div>
                    <div className="eyebrow">CATÁLOGO DE MÁQUINAS</div>
                    <h2>Escolha uma máquina para começar.</h2>
                  </div>

                  <div className="catalog-search">
                    <Search size={17} />

                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar máquina..."
                    />
                  </div>
                </div>

                <div className="filter-row">
                  {categories.map((item) => (
                    <button
                      key={item}
                      className={
                        category === item
                          ? "filter-chip filter-chip--active"
                          : "filter-chip"
                      }
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </button>
                  ))}

                  <span className="catalog-count">
                    {filteredMachines.length} resultados
                  </span>
                </div>

                {filteredMachines.length > 0 ? (
                  <div className="machine-grid">
                    {filteredMachines.map((machine) => (
                      <MachineCard
                        key={machine.id}
                        machine={machine}
                        onOpen={openMachine}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Search size={22} />
                    <h3>Nenhuma máquina encontrada</h3>
                    <p>Tente buscar por outro nome ou categoria.</p>
                  </div>
                )}
              </div>
            </section>
          )}          {activeTab === "explore" && <section className="how-section" id="how-it-works"><div className="container"><div className="how-header"><div><div className="eyebrow">COMO FUNCIONA</div><h2 className="rodape">Do QR ao conhecimento<br /><em>em três passos.</em></h2></div><div className="how-intro"><p>Uma experiência pública e direta: não precisa baixar app, criar conta ou lembrar de senha para aprender.</p><button className="text-link" onClick={() => toast.info("No produto completo, o QR será impresso e aplicado em cada máquina.")}>Entender o produto <ArrowUpRight size={16} /></button></div></div><div className="steps-grid"><div className="how-step"><span className="how-step__number">01</span><div className="how-step__icon"><QrCode size={23} /></div><h3>Aponte o celular</h3><p>O QR fica na etiqueta da máquina, em um lugar visível e fácil de alcançar.</p></div><div className="how-step how-step--accent"><span className="how-step__number">02</span><div className="how-step__icon"><Hand size={23} /></div><h3>Assista em Libras</h3><p>O perfil abre com vídeo, legenda e os pontos essenciais da operação.</p></div><div className="how-step"><span className="how-step__number">03</span><div className="how-step__icon"><History size={23} /></div><h3>Volte quando quiser</h3><p>Seu histórico guarda os vídeos vistos para uma nova consulta rápida.</p></div></div></div></section>}
          {activeTab === "history" && <section className="history-page"><div className="container"><div className="history-hero"><div><div className="eyebrow"><span className="eyebrow-dot" /> SEU ESPAÇO DE APRENDIZADO</div><h1>Rever também<br /><em>é aprender.</em></h1><p>Continue de onde parou ou relembre uma operação importante.</p></div><div className="history-score"><div className="score-ring"><span>02</span><small>vídeos</small></div><span>vistos por você</span></div></div><div className="history-list"><div className="section-heading"><div><div className="eyebrow">ATIVIDADE RECENTE</div><h2>Seus vídeos</h2></div><span className="muted-label">Salvo neste dispositivo</span></div>{historyMachines.map((machine) => <HistoryCard key={machine.id} machine={machine} onOpen={openMachine} />)}</div><div className="history-tip"><Sparkles size={19} /><div><strong>Dica de acessibilidade</strong><p>Você não precisa criar uma conta para usar o histórico neste protótipo. No produto final, o login pode sincronizar seu progresso entre dispositivos.</p></div></div></div></section>}
        </main>
      )}
      <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><BrandMark /><span>Mec<span className="brand-accent">Libras</span></span></div><span>MecLibras · 2026</span><div className="footer-links"><button onClick={() => toast.info("Guia de acessibilidade em breve.")}>Acessibilidade</button><button onClick={() => toast.info("Sobre o projeto em breve.")}>Sobre o projeto</button></div></div></footer>
    </div>
  );
}

function BookmarkIcon() {
  return <span className="bookmark-icon" aria-hidden="true" />;
}
