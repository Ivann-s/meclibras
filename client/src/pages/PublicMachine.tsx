import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { getMachineBySlug } from "../lib/machines";

type PublicMachine = {
  name: string;
  description: string | null;
  instructions: string | null;
  video_url: string | null;
};

export default function PublicMachine() {
  const [, params] = useRoute("/m/:slug");
  const [machine, setMachine] = useState<PublicMachine | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.slug) return;
    getMachineBySlug(params.slug)
      .then((data) => setMachine(data as PublicMachine))
      .catch(() => setError("Conteúdo não encontrado ou ainda não publicado."));
  }, [params?.slug]);

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
        {machine.video_url ? <video className="machine-video-real public-video" controls playsInline src={machine.video_url}>Seu navegador não suporta vídeos.</video> : <div className="video-placeholder">Vídeo em Libras ainda não cadastrado.</div>}
        {steps.length > 0 && <section className="public-instructions"><h2>Orientações</h2><ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol></section>}
      </div>
    </main>
  );
}
