import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/Badge"
import { FieldRow } from "@/components/ui/FieldRow"
import { SensField } from "@/components/ui/SensField"
import { DataList, DataItem } from "@/components/ui/DataItem"
import type { ReactNode } from "react"

function SectionHdr({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-[10px]">
      <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">{title}</span>
      {action}
    </div>
  )
}

function Card({
  title,
  icon,
  extra,
  children,
}: {
  title: string
  icon: Parameters<typeof Icon>[0]["name"]
  extra?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="bg-card border border-hair rounded-lg p-4 hover:border-ink-4 transition-colors">
      <div className="text-[12.5px] font-bold text-ink mb-3 flex items-center gap-[7px] tracking-[-.15px]">
        <Icon name={icon} size={14} className="text-ink-2" />
        <span>{title}</span>
        {extra && <span className="ml-auto">{extra}</span>}
      </div>
      {children}
    </div>
  )
}

function EditBtn() {
  return (
    <button className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-accent border border-hair px-[11px] py-[5px] rounded-md hover:border-accent transition-colors">
      <Icon name="edit" size={13} />
      Editar
    </button>
  )
}

function AddBtn({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-accent border border-dashed border-ink-4 px-[11px] py-[5px] rounded-md hover:border-accent transition-colors">
      <Icon name="plus" size={13} />
      {label}
    </button>
  )
}

/* ── ALERT BANNERS ─────────────────── */
function Banner({
  variant,
  children,
}: {
  variant: "danger" | "warn" | "info"
  children: ReactNode
}) {
  const cls = {
    danger: "bg-red-50 text-red-800 border-red-200",
    warn: "bg-amber-50 text-amber-800 border-amber-200",
    info: "bg-accent-soft text-accent border-indigo-200",
  }[variant]
  return (
    <div className={`flex items-center gap-[10px] px-[14px] py-[10px] rounded-md font-semibold border text-[12.5px] ${cls}`}>
      {children}
    </div>
  )
}

/* ═══════════════════ TAB 1: IDENTIDADE ═══════════════════ */
export function IdentidadeTab() {
  return (
    <>
      <div>
        <SectionHdr title="Dados pessoais" action={<EditBtn />} />
        <div className="grid grid-cols-2 gap-3">
          <Card title="Informações gerais" icon="user">
            <FieldRow label="Nome completo">Felipe Braz Palhares</FieldRow>
            <FieldRow label="Apelido">Felipe</FieldRow>
            <FieldRow label="Nascimento">
              15/03/1985 <Badge variant="neutral">40 anos</Badge>
            </FieldRow>
            <FieldRow label="Estado civil">Casado</FieldRow>
            <FieldRow label="Religião">Católico</FieldRow>
            <FieldRow label="Naturalidade">Curitiba — PR</FieldRow>
          </Card>
          <Card title="Documentos" icon="card">
            <FieldRow label="CPF">
              <SensField
                masked="***.786.456-**"
                real="023.786.456-09"
                suffix={<Badge variant="green">Regular</Badge>}
              />
            </FieldRow>
            <FieldRow label="RG">
              <SensField masked="**.**.**-5" real="12.345.678-5" />
            </FieldRow>
            <FieldRow label="CNH">
              <SensField masked="*****34567**" suffix={<Badge variant="green">Cat. B · 03/2027</Badge>} />
            </FieldRow>
            <FieldRow label="Passaporte">
              <SensField masked="BR*****89" suffix={<Badge variant="green">06/2028</Badge>} />
            </FieldRow>
          </Card>
        </div>
      </div>

      <div>
        <SectionHdr title="Endereços" action={<AddBtn label="Adicionar" />} />
        <div className="grid grid-cols-2 gap-3">
          <Card
            title="Residência principal"
            icon="home"
            extra={<Badge variant="indigo">Principal</Badge>}
          >
            <FieldRow label="Logradouro">Av. Batel, 1234</FieldRow>
            <FieldRow label="Complemento">Apto 82, Torre A</FieldRow>
            <FieldRow label="Bairro">Batel</FieldRow>
            <FieldRow label="Cidade/UF">Curitiba — PR</FieldRow>
            <FieldRow label="CEP">80.420-090</FieldRow>
          </Card>
          <div className="bg-card border border-dashed border-hair rounded-lg p-10 text-center text-ink-3 text-xs flex flex-col items-center justify-center">
            <div className="mb-3">Nenhum endereço alternativo</div>
            <AddBtn label="Adicionar endereço" />
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════ TAB 2: EMPRESARIAL ═══════════════════ */
export function EmpresarialTab() {
  return (
    <div>
      <SectionHdr title="Empresas" action={<AddBtn label="Nova empresa" />} />

      <div className="bg-card border border-hair rounded-lg p-4 mb-3 hover:border-ink-4 transition-colors">
        <div className="text-[12.5px] font-bold text-ink mb-3 flex items-center gap-[7px] tracking-[-.15px]">
          <Icon name="building" size={14} className="text-ink-2" />
          PalharesTech Ltda.
          <span className="ml-auto">
            <Badge variant="green">Ativa</Badge>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <FieldRow label="CNPJ">
              <SensField masked="**.***.***/0001-**" real="12.345.678/0001-90" />
            </FieldRow>
            <FieldRow label="Ramo">Tecnologia · Desenvolvimento</FieldRow>
            <FieldRow label="Cargo">CEO e Sócio-Fundador</FieldRow>
            <FieldRow label="Participação">
              <Badge variant="indigo">70%</Badge>
            </FieldRow>
          </div>
          <div>
            <FieldRow label="Contador">José Ferreira — CRC 12345-PR</FieldRow>
            <FieldRow label="Advogado">Dra. Maria Lima — OAB/PR 54321</FieldRow>
            <FieldRow label="Sistemas">
              <div className="flex gap-1 flex-wrap">
                <Badge variant="gray">SAP</Badge>
                <Badge variant="gray">Salesforce</Badge>
                <Badge variant="gray">G Suite</Badge>
              </div>
            </FieldRow>
          </div>
        </div>
        <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.06em] mb-2">Sócios</div>
        <DataList>
          <DataItem
            main="Felipe Braz Palhares"
            sub="CPF ***.786.456-**"
            right={<Badge variant="indigo">70%</Badge>}
          />
          <DataItem
            main="João Ricardo Santos"
            sub="CPF ***.***.**-**"
            right={<Badge variant="gray">30%</Badge>}
          />
        </DataList>
      </div>

      <Card title="Distribuidora Braz Ltda." icon="building" extra={<Badge variant="green">Ativa</Badge>}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldRow label="CNPJ">
              <SensField masked="**.***.***/0001-**" real="98.765.432/0001-10" />
            </FieldRow>
            <FieldRow label="Ramo">Distribuição e Comércio</FieldRow>
            <FieldRow label="Cargo">Sócio Administrador</FieldRow>
            <FieldRow label="Participação">
              <Badge variant="indigo">100%</Badge>
            </FieldRow>
          </div>
          <div>
            <FieldRow label="Sistemas">
              <div className="flex gap-1 flex-wrap">
                <Badge variant="gray">TOTVS</Badge>
                <Badge variant="gray">ERP interno</Badge>
              </div>
            </FieldRow>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════ TAB 3: FAMÍLIA ═══════════════════ */
export function FamiliaTab() {
  return (
    <>
      <div>
        <SectionHdr title="Cônjuge" action={<EditBtn />} />
        <Card title="Ana Carolina Palhares" icon="user">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldRow label="CPF">
                <SensField masked="***.***.**-**" real="987.654.321-00" />
              </FieldRow>
              <FieldRow label="Aniversário">22/08/1987</FieldRow>
            </div>
            <div>
              <FieldRow label="WhatsApp">
                <SensField masked="(41) 9 ****-****" real="(41) 9 9876-5432" />
              </FieldRow>
              <FieldRow label="E-mail">ana.palhares@email.com</FieldRow>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <SectionHdr title="Filhos" action={<AddBtn label="Adicionar" />} />
        <div className="grid grid-cols-2 gap-3">
          <Card title="Mateus Palhares" icon="user" extra={<Badge variant="neutral">12 anos</Badge>}>
            <FieldRow label="Nascimento">05/03/2012</FieldRow>
            <FieldRow label="Escola">Colégio Marista Rosário</FieldRow>
            <FieldRow label="Médico">Dr. Pedro Almeida</FieldRow>
          </Card>
          <Card title="Sofia Palhares" icon="user" extra={<Badge variant="neutral">8 anos</Badge>}>
            <FieldRow label="Nascimento">14/09/2016</FieldRow>
            <FieldRow label="Escola">Colégio Positivo Junior</FieldRow>
            <FieldRow label="Médico">Dr. Pedro Almeida</FieldRow>
          </Card>
        </div>
      </div>

      <div>
        <SectionHdr title="Pais e irmãos" />
        <DataList>
          <DataItem
            main={
              <>
                José Braz Palhares <Badge variant="gray">Pai</Badge>
              </>
            }
            sub="10/11/1955 · (41) 9 ****-****"
          />
          <DataItem
            main={
              <>
                Maria Helena Palhares <Badge variant="gray">Mãe</Badge>
              </>
            }
            sub="03/04/1958 · (41) 9 ****-****"
          />
          <DataItem
            main={
              <>
                Ricardo Braz Palhares <Badge variant="gray">Irmão</Badge>
              </>
            }
            sub="(41) 9 ****-****"
          />
        </DataList>
      </div>
    </>
  )
}

/* ═══════════════════ TAB 4: FINANCEIRO ═══════════════════ */
export function FinanceiroTab() {
  return (
    <>
      <div>
        <SectionHdr title="Bancos e contas" action={<AddBtn label="Adicionar" />} />
        <DataList>
          <DataItem
            main="Itaú Unibanco"
            sub="Ag. 0001 · CC 12345-6 · Corrente"
            right={<Badge variant="indigo">Principal</Badge>}
          />
          <DataItem main="Nubank" sub="CC 78901-2 · Digital" right={<Badge variant="gray">Digital</Badge>} />
          <DataItem
            main="Bradesco"
            sub="Ag. 0567 · CP 34567-8 · Poupança"
            right={<Badge variant="gray">Poupança</Badge>}
          />
        </DataList>
      </div>

      <div>
        <SectionHdr title="Investimentos" />
        <DataList>
          <DataItem
            main="Tesouro Direto"
            sub="Itaú Investimentos"
            right={
              <>
                <div className="text-[12.5px] font-bold tabular">R$ 150.000</div>
                <Badge variant="green">+8,2%</Badge>
              </>
            }
          />
          <DataItem
            main="FIIs"
            sub="XP Investimentos"
            right={
              <>
                <div className="text-[12.5px] font-bold tabular">R$ 80.000</div>
                <Badge variant="green">+6,8%</Badge>
              </>
            }
          />
          <DataItem
            main="Ações"
            sub="Rico"
            right={
              <>
                <div className="text-[12.5px] font-bold tabular">R$ 50.000</div>
                <Badge variant="amber">−2,1%</Badge>
              </>
            }
          />
          <DataItem
            main="CDB"
            sub="Nubank · 112% CDI"
            right={
              <>
                <div className="text-[12.5px] font-bold tabular">R$ 30.000</div>
                <Badge variant="green">+12%</Badge>
              </>
            }
          />
        </DataList>
      </div>

      <div>
        <SectionHdr title="Imóveis" action={<AddBtn label="Adicionar" />} />
        <div className="grid grid-cols-2 gap-3">
          <Card title="Residência Batel" icon="home" extra={<Badge variant="green">Quitado</Badge>}>
            <FieldRow label="Endereço">Av. Batel, 1234</FieldRow>
            <FieldRow label="Matrícula">123.456</FieldRow>
            <FieldRow label="Valor">
              <span className="font-bold tabular">R$ 850.000</span>
            </FieldRow>
          </Card>
          <Card title="Sala Comercial" icon="building" extra={<Badge variant="amber">Financiado</Badge>}>
            <FieldRow label="Endereço">R. XV, 567 · Curitiba</FieldRow>
            <FieldRow label="Matrícula">789.012</FieldRow>
            <FieldRow label="Valor">
              <span className="font-bold tabular">R$ 420.000</span>
            </FieldRow>
            <FieldRow label="Financiado até">Dezembro / 2031</FieldRow>
          </Card>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════ TAB 5: JURÍDICO ═══════════════════ */
export function JuridicoTab() {
  return (
    <>
      <Banner variant="danger">
        Prazo processual em <strong className="mx-1">12 dias</strong> — Proc. 0001234-56.2024 · Dr.
        Carlos Lima já foi notificado
      </Banner>
      <Banner variant="warn">
        Contrato de locação comercial vence em <strong className="mx-1">30 dias</strong> — renovar ou
        rescindir
      </Banner>

      <div>
        <SectionHdr title="Processos ativos" action={<AddBtn label="Adicionar" />} />

        <div className="bg-card border border-hair border-l-[3px] border-l-err rounded-lg p-4 mb-[10px]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">
              Reclamação Trabalhista
            </div>
            <Badge variant="red">Em andamento</Badge>
          </div>
          <div className="text-[10.5px] font-semibold text-ink-3 mono">Nº 0001234-56.2024.5.09.0001</div>
          <div className="grid grid-cols-2 gap-3 mt-[10px]">
            <div>
              <FieldRow label="Vara">1ª Vara do Trabalho</FieldRow>
              <FieldRow label="Tipo">Trabalhista</FieldRow>
            </div>
            <div>
              <FieldRow label="Advogado">Dr. Carlos Lima · OAB/PR 54321</FieldRow>
              <FieldRow label="Próx. prazo">
                <Badge variant="red">05/05/2026 — 12d</Badge>
              </FieldRow>
            </div>
          </div>
        </div>

        <div className="bg-card border border-hair border-l-[3px] border-l-warn rounded-lg p-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">Ação Declaratória</div>
            <Badge variant="amber">Aguardando</Badge>
          </div>
          <div className="text-[10.5px] font-semibold text-ink-3 mono">Nº 0005678-12.2023.8.16.0001</div>
          <div className="grid grid-cols-2 gap-3 mt-[10px]">
            <div>
              <FieldRow label="Vara">3ª Vara Cível</FieldRow>
              <FieldRow label="Tipo">Cível</FieldRow>
            </div>
            <div>
              <FieldRow label="Advogado">Dra. Maria Lima · OAB/PR 67890</FieldRow>
              <FieldRow label="Próx. prazo">
                <Badge variant="gray">20/06/2026</Badge>
              </FieldRow>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionHdr title="Contratos importantes" />
        <DataList>
          <DataItem
            main="Locação Comercial"
            sub="PalharesTech × Imobiliária ABC · 12/2026"
            right={<Badge variant="amber">Vence em 30d</Badge>}
          />
          <DataItem
            main="Prestação de Serviços"
            sub="PalharesTech × Cliente XYZ · 03/2027"
            right={<Badge variant="green">OK</Badge>}
          />
        </DataList>
      </div>

      <div>
        <SectionHdr title="Alertas automáticos" />
        <DataList>
          <DataItem
            main="30 dias antes"
            sub="Prazos e vencimentos de contratos"
            right={<Badge variant="green">Ativo</Badge>}
          />
          <DataItem
            main="15 dias antes"
            sub="Prazos processuais"
            right={<Badge variant="green">Ativo</Badge>}
          />
          <DataItem
            main="7 dias antes"
            sub="Prazos processuais urgentes"
            right={<Badge variant="green">Ativo</Badge>}
          />
        </DataList>
      </div>
    </>
  )
}

/* ═══════════════════ TAB 6: ACESSOS ═══════════════════ */
function VaultItem({
  name,
  user,
  icon,
}: {
  name: string
  user: string
  icon: Parameters<typeof Icon>[0]["name"]
}) {
  return (
    <div className="flex items-center gap-[10px] px-[14px] py-[10px] bg-bg border border-hair rounded-md mb-[6px]">
      <div className="w-[30px] h-[30px] rounded-[7px] bg-card border border-hair flex items-center justify-center text-ink-2 shrink-0">
        <Icon name={icon} size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold text-ink tracking-[-.1px]">{name}</div>
        <div className="text-[11px] text-ink-3 font-medium mt-0.5">{user}</div>
      </div>
      <div className="mono text-[12px] text-ink-2 tracking-[.05em] px-2">●●●●●●●●</div>
      <button className="text-ink-3 hover:text-accent p-0.5 rounded">
        <Icon name="eye" size={13} />
      </button>
      <button className="bg-card border border-hair rounded px-2 py-1 text-[10.5px] font-semibold text-ink-2 hover:border-ink-4 hover:text-ink transition-colors">
        Copiar
      </button>
    </div>
  )
}

export function AcessosTab() {
  return (
    <>
      <Banner variant="info">
        Todos os dados deste cofre são criptografados com AES-256 antes de salvar no banco local
      </Banner>

      <div>
        <SectionHdr title="Portais governamentais" action={<AddBtn label="Adicionar" />} />
        <VaultItem name="e-CAC · Receita Federal" user="CPF ***.786.456-**" icon="bank" />
        <VaultItem name="GOV.BR" user="Nível: Ouro" icon="globe" />
        <VaultItem name="TJ-PR" user="Login: fpalhares" icon="shield" />
      </div>

      <div>
        <SectionHdr title="Bancos online" />
        <VaultItem name="Itaú" user="Ag. 0001 · CC 12345-6" icon="bank" />
        <VaultItem name="Nubank" user="felipe@email.com" icon="bank" />
      </div>
    </>
  )
}

/* ═══════════════════ TAB 7: OBJETIVOS ═══════════════════ */
function Goal({
  label,
  progress,
  badge,
}: {
  label: string
  progress: number
  badge: { text: string; variant: "green" | "amber" | "indigo" }
}) {
  return (
    <div className="flex items-start gap-[10px] px-3 py-[10px] rounded-md bg-bg border border-hair mb-[6px]">
      <div className="flex-1">
        <div className="text-[12.5px] font-medium text-ink tracking-[-.05px]">{label}</div>
        <div className="h-[3px] bg-hair rounded-full overflow-hidden mt-[6px]">
          <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <Badge variant={badge.variant}>{badge.text}</Badge>
    </div>
  )
}

export function ObjetivosTab() {
  return (
    <>
      <div>
        <SectionHdr title="Metas pessoais 2026" action={<EditBtn />} />
        <div className="bg-card border border-hair rounded-lg p-4">
          <Goal
            label="Tirar férias em julho — viagem internacional com a família"
            progress={20}
            badge={{ text: "20%", variant: "amber" }}
          />
          <Goal
            label="Academia 3× por semana · consistência anual"
            progress={60}
            badge={{ text: "60%", variant: "green" }}
          />
          <Goal
            label="Ler 12 livros no ano — 1 por mês"
            progress={33}
            badge={{ text: "4/12", variant: "indigo" }}
          />
        </div>
      </div>

      <div>
        <SectionHdr title="Metas empresariais 2026" />
        <div className="bg-card border border-hair rounded-lg p-4">
          <Goal
            label="PalharesTech — Faturar R$ 5M (atual R$ 2,8M)"
            progress={56}
            badge={{ text: "56%", variant: "green" }}
          />
          <Goal
            label="Distribuidora Braz — Abrir CD em São Paulo"
            progress={30}
            badge={{ text: "30%", variant: "amber" }}
          />
          <Goal
            label="Contratar 2 desenvolvedores sênior"
            progress={50}
            badge={{ text: "1/2", variant: "indigo" }}
          />
        </div>
      </div>

      <div>
        <SectionHdr title="Como prefere ser tratado" action={<EditBtn />} />
        <div className="bg-card border border-hair rounded-lg p-4">
          <div className="bg-bg border border-hair rounded-md p-4 text-[12.5px] text-ink-2 leading-[1.65] font-medium">
            Chame-me de <strong>Felipe</strong>. Seja direto e objetivo — evite enrolação.
            <br />
            Use <strong>listas e bullet points</strong> sempre que possível.
            <br />
            Quando houver prazo ou urgência, <strong>destaque em negrito e no início</strong> da resposta.
            <br />
            Lembre-me proativamente de compromissos e prazos próximos.
            <br />
            No contexto empresarial, assuma que sou o decisor final.
          </div>
        </div>
      </div>

      <div>
        <SectionHdr title="Disponibilidade" />
        <div className="bg-card border border-hair rounded-lg p-4">
          <div className="grid grid-cols-7 gap-[5px] text-center">
            {(
              [
                ["Seg", "08–18h", "on"],
                ["Ter", "08–18h", "on"],
                ["Qua", "08–18h", "on"],
                ["Qui", "08–18h", "on"],
                ["Sex", "08–18h", "on"],
                ["Sáb", "09–12h", "half"],
                ["Dom", "Folga", "off"],
              ] as const
            ).map(([day, hours, state]) => (
              <div key={day}>
                <div className="text-[10px] font-bold text-ink-3 uppercase">{day}</div>
                <div
                  className={`rounded-md py-1.5 text-[10.5px] font-semibold mt-1 border ${
                    state === "on"
                      ? "bg-accent-soft text-accent border-indigo-200"
                      : state === "half"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-hair-2 text-ink-3 border-hair"
                  }`}
                >
                  {hours}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11.5px] text-ink-2 font-medium">
            Urgências disponíveis via WhatsApp 24h para emergências
          </div>
        </div>
      </div>

      <div>
        <SectionHdr title="Prioridades de vida" />
        <DataList>
          <DataItem main="1 · Família" sub="Tempo de qualidade com Ana, Mateus e Sofia" />
          <DataItem main="2 · Saúde" sub="Física e mental" />
          <DataItem main="3 · Negócios" sub="Crescimento sustentável das empresas" />
          <DataItem main="4 · Lazer e Cultura" sub="Viagens, leitura, experiências" />
        </DataList>
      </div>
    </>
  )
}
