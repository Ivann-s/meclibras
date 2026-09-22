import { useEffect, useState, type FormEvent } from "react";
import { Link, useRoute } from "wouter";
import { createSuggestion, getMachineBySlug } from "../lib/machines";

type PublicMachineData = {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  content_type?: "video" | "text" | null;
  text_content?: string | null;
  video_url: string | null;
  subtitle_url?: string | null;
};

export default function PublicMachine() {
  const [, params] = useRoute("/m/:slug");
  const [machine, setMachine] = useState<PublicMachineData | null>(null);
  const [error, setError] = useState("");
  const [sendingSuggestion, setSendingSuggestion] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({ message: "", userName: "", userContact: "" });

  useEffect(() => {
    if (!params?.slug) return;
    getMachineBySlug(params.slug).then((data) => setMachine(data as PublicMachineData)).catch(() => setError("Conteúdo não encontrado ou ainda não publicado."));
  }, [params?.slug]);

  async function handleSuggestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (suggestionForm.message.trim().length < 5) {
      window.alert("Escreva uma sugestão com pelo menos 5 caracteres.");
      return;
    }
    setSendingSuggestion(true);
    try {
      await createSuggestion({ machineId: machine?.id, message: suggestionForm.message, userName: suggestionForm.userName, userContact: suggestionForm.userContact });
      setSuggestionForm({ message: "", userName: "", userContact: "" });
      window.alert("Sua sugestão foi enviada com sucesso. Obrigado!");
    } catch (suggestionError) {
      console.error("Erro ao enviar sugestão:", suggestionError);
      window.alert("Não foi possível enviar a sugestão agora. Tente novamente.");
    } finally {
      setSendingSuggestion(false);
    }
  }

  if (error) return <main className="detail-page"><div className="container"><h1>{error}</h1><Link href="/">Voltar para o MecLibras</Link></div></main>;
  if (!machine) return <main className="detail-page"><div className="container"><p>Carregando conteúdo...</p></div></main>;

  const steps = (machine.instructions ?? "").split("\n").map((item) => item.trim()).filter(Boolean);

  return (
    <main className="detail-page public-machine-page">
      <div className="container">
        <Link className="back-link" href="/">← Voltar para o MecLibras</Link>
        <div className="eyebrow">PÁGINA PÚBLICA DA MÁQUINA</div>
        <h1>{machine.name}</h1>
        <p>{machine.description}</p>
        {machine.content_type === "text" ? <section className="text-material-public"><div className="eyebrow">MATERIAL DIDÁTICO</div><h2>Orientações e procedimento</h2><div className="text-material-public__body">{machine.text_content || "Nenhum texto explicativo foi cadastrado."}</div></section> : machine.video_url ? <video className="machine-video-real public-video" controls playsInline preload="metadata" poster={`${import.meta.env.BASE_URL}video-thumb.png`} src={machine.video_url}>Seu navegador não suporta vídeos.</video> : <div className="video-placeholder">Vídeo em Libras ainda não cadastrado.</div>}
        {machine.subtitle_url && <p><a href={machine.subtitle_url} target="_blank" rel="noreferrer">Abrir legenda</a></p>}
        {steps.length > 0 && <section className="public-instructions"><h2>Orientações</h2><ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol></section>}
        <section className="suggestion-section">
          <div className="eyebrow">PARTICIPE DA MELHORIA</div>
          <h2>Envie uma sugestão</h2>
          <p>Encontrou algum problema ou tem uma ideia para melhorar este conteúdo? Envie uma mensagem para a equipe responsável.</p>
          <form className="suggestion-form" onSubmit={handleSuggestionSubmit}>
            <label htmlFor="suggestion-message">Sua sugestão <span>*</span></label>
            <textarea id="suggestion-message" required minLength={5} maxLength={1000} rows={5} value={suggestionForm.message} onChange={(event) => setSuggestionForm((current) => ({ ...current, message: event.target.value }))} placeholder="Digite sua sugestão, dúvida ou relato..." />
            <label htmlFor="suggestion-name">Seu nome <small>(opcional)</small></label>
            <input id="suggestion-name" type="text" maxLength={120} value={suggestionForm.userName} onChange={(event) => setSuggestionForm((current) => ({ ...current, userName: event.target.value }))} placeholder="Como podemos chamar você?" />
            <label htmlFor="suggestion-contact">E-mail ou contato <small>(opcional)</small></label>
            <input id="suggestion-contact" type="text" maxLength={160} value={suggestionForm.userContact} onChange={(event) => setSuggestionForm((current) => ({ ...current, userContact: event.target.value }))} placeholder="Se quiser receber um retorno" />
            <button className="button button--dark" type="submit" disabled={sendingSuggestion}>{sendingSuggestion ? "Enviando..." : "Enviar sugestão"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
