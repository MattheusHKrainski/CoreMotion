import Link from "next/link";
import VerifiedBadge from "@/components/VerifiedBadge";
import { IconShield, IconCheckCircle } from "@/components/Icons";

export default function VerificacaoInfoPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">Verificação oficial CoreMotion</h1>
      <p className="text-slate-600">Entenda o que significa o selo Verificado e como funciona o processo.</p>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-2">
          <span className="font-black text-lg">Nike</span>
          <VerifiedBadge size="md" />
        </div>
        <p className="mt-3 text-sm text-slate-700">
          O selo <strong>Verificado</strong> significa que o CoreMotion analisou e confirmou a legitimidade desta loja de acordo com critérios internos: existência da empresa, dados correspondentes, vínculo legítimo do responsável e representação da marca.
        </p>
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          O selo NÃO significa garantia automática de todos os produtos, preços ou entrega. Cada loja é responsável por seus anúncios, estoque e atendimento. O CoreMotion atua como marketplace e intermediador.
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-black text-lg flex items-center gap-2"><IconShield width={18} height={18} /> Processo de verificação</h2>
        <ol className="mt-4 space-y-3 text-sm">
          {[
            { s: "Solicitação", d: "Lojista preenche dados da empresa, responsável e marca em /minha-loja/verificacao" },
            { s: "Análise", d: "Equipe CoreMotion verifica CNPJ, domínio, e-mail comercial, site oficial e redes sociais. Pode solicitar documentos adicionais." },
            { s: "Contato oficial", d: "Para marcas como Nike, Adidas, equipe pode entrar em contato via canais oficiais da marca para confirmar vínculo." },
            { s: "Aprovação", d: "Admin aprova em /admin/verificacoes. Loja recebe verified=true e selo aparece automaticamente na vitrine e em todos os produtos." },
            { s: "Revogação", d: "Se descumprir critérios, admin revoga. Selo desaparece automaticamente de todos os lugares, sem editar produto por produto." },
          ].map((it) => (
            <li key={it.s} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white grid place-items-center text-xs font-bold shrink-0">{it.s[0]}</span>
              <div><strong>{it.s}:</strong> {it.d}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-black text-lg flex items-center gap-2"><IconCheckCircle width={18} height={18} /> Selo nos produtos</h2>
        <p className="text-sm text-slate-600 mt-2">
          Se a loja é verificada, todos os produtos dela exibem automaticamente o selo associado à loja. O selo pertence à loja, não ao produto individualmente.
        </p>
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
          <div className="font-bold">Nike Air Max — R$ 799,90</div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span>Nike</span>
            <VerifiedBadge size="sm" />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href="/lojas" className="bg-slate-900 text-white font-bold px-5 py-2.5 rounded-full text-sm">Ver lojas verificadas</Link>
        <Link href="/minha-loja/verificacao" className="border border-slate-200 font-bold px-5 py-2.5 rounded-full text-sm hover:border-slate-400">Solicitar verificação</Link>
      </div>
    </div>
  );
}
