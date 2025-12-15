"use client"

import { useState, useEffect } from 'react'
import { Calendar, Users, Settings, CreditCard, LayoutDashboard, Plus, Search, ChevronLeft, ChevronRight, Eye, EyeOff, Trash2, User, Phone, Mail, Clock, LogOut, Bell, UserCircle, Brain, X, FileText, TrendingUp, StickyNote, Edit, LineChart, ArrowUp, Crown, Menu } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Criar client do Supabase APENAS dentro do componente client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Tipos de planos
type PlanType = 'start' | 'pro' | 'infinity'

interface Plan {
  id: PlanType
  name: string
  price: number
  features: {
    support: string
    maxClients: number | 'unlimited'
    scheduling: boolean
    reminders: boolean
    templates: boolean
    evolution: boolean
  }
}

// Definição dos planos
const plans: Record<PlanType, Plan> = {
  start: {
    id: 'start',
    name: 'Plano Start',
    price: 47.00,
    features: {
      support: 'Horário comercial (10h-18h)',
      maxClients: 15,
      scheduling: true,
      reminders: false,
      templates: false,
      evolution: false
    }
  },
  pro: {
    id: 'pro',
    name: 'Plano Pro',
    price: 97.00,
    features: {
      support: 'Suporte 24 horas',
      maxClients: 65,
      scheduling: true,
      reminders: true,
      templates: true,
      evolution: false
    }
  },
  infinity: {
    id: 'infinity',
    name: 'Plano Infinity',
    price: 197.00,
    features: {
      support: 'Suporte 24h com prioridade',
      maxClients: 'unlimited',
      scheduling: true,
      reminders: true,
      templates: true,
      evolution: true
    }
  }
}

// Tipos de dados
interface Client {
  id: string
  name: string
  age: number
  phone: string
  email: string
  emergencyPhone: string
  gender: string
  birthDate: string
  mainProblem: string
  createdAt: string
}

interface Session {
  id: string
  clientId: string
  clientName: string
  date: string
  time: string
  type: 'online' | 'presencial'
  status: 'agendada' | 'confirmada' | 'cancelada' | 'faltou'
}

interface User {
  name: string
  email: string
  timezone: string
  currentPlan: PlanType
  planStatus: 'active' | 'inactive' | 'cancelled'
  nextBilling: string
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paga' | 'atrasada'
  description: string
}

interface Ficha {
  id: string
  clientId: string
  type: 'Anamnese' | 'BAI (Ansiedade)' | 'BDI (Depressão)' | 'TCC' | 'Infantil'
  createdAt: string
  data: any
}

interface Nota {
  id: string
  clientId: string
  content: string
  createdAt: string
}

interface EvolucaoEntry {
  id: string
  clientId: string
  sintomaPrincipal: string
  nota: number
  createdAt: string
}

// Função auxiliar para obter data local no formato YYYY-MM-DD (SEM ajuste de fuso horário)
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Função para calcular idade a partir da data de nascimento
const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Estados brasileiros para fuso horário - CORRIGIDO com IDs únicos
const brazilianStates = [
  { id: 'sp', value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { id: 'ac', value: 'America/Rio_Branco', label: 'Acre (GMT-5)' },
  { id: 'al', value: 'America/Maceio', label: 'Alagoas (GMT-3)' },
  { id: 'am', value: 'America/Manaus', label: 'Amazonas (GMT-4)' },
  { id: 'ba', value: 'America/Salvador', label: 'Bahia (GMT-3)' },
  { id: 'ce', value: 'America/Fortaleza', label: 'Ceará (GMT-3)' },
  { id: 'es', value: 'America/Sao_Paulo', label: 'Espírito Santo (GMT-3)' },
  { id: 'go', value: 'America/Sao_Paulo', label: 'Goiás (GMT-3)' },
  { id: 'ma', value: 'America/Fortaleza', label: 'Maranhão (GMT-3)' },
  { id: 'mt', value: 'America/Cuiaba', label: 'Mato Grosso (GMT-4)' },
  { id: 'ms', value: 'America/Campo_Grande', label: 'Mato Grosso do Sul (GMT-4)' },
  { id: 'mg', value: 'America/Sao_Paulo', label: 'Minas Gerais (GMT-3)' },
  { id: 'pa', value: 'America/Santarem', label: 'Pará (GMT-3)' },
  { id: 'pb', value: 'America/Fortaleza', label: 'Paraíba (GMT-3)' },
  { id: 'pr', value: 'America/Sao_Paulo', label: 'Paraná (GMT-3)' },
  { id: 'pe', value: 'America/Recife', label: 'Pernambuco (GMT-3)' },
  { id: 'pi', value: 'America/Fortaleza', label: 'Piauí (GMT-3)' },
  { id: 'rj', value: 'America/Sao_Paulo', label: 'Rio de Janeiro (GMT-3)' },
  { id: 'rn', value: 'America/Fortaleza', label: 'Rio Grande do Norte (GMT-3)' },
  { id: 'rs', value: 'America/Sao_Paulo', label: 'Rio Grande do Sul (GMT-3)' },
  { id: 'ro', value: 'America/Porto_Velho', label: 'Rondônia (GMT-4)' },
  { id: 'rr', value: 'America/Boa_Vista', label: 'Roraima (GMT-4)' },
  { id: 'sc', value: 'America/Sao_Paulo', label: 'Santa Catarina (GMT-3)' },
  { id: 'se', value: 'America/Maceio', label: 'Sergipe (GMT-3)' },
  { id: 'to', value: 'America/Araguaina', label: 'Tocantins (GMT-3)' },
  { id: 'df', value: 'America/Sao_Paulo', label: 'Distrito Federal (GMT-3)' },
]

// Modelos de fichas
const fichaModels = {
  'Anamnese': {
    fields: [
      { name: 'nomeCompleto', label: 'Nome Completo', type: 'text' },
      { name: 'idade', label: 'Idade', type: 'number' },
      { name: 'estadoCivil', label: 'Estado Civil', type: 'select', options: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)'] },
      { name: 'profissao', label: 'Profissão', type: 'text' },
      { name: 'motivoConsulta', label: 'Motivo da Consulta', type: 'textarea' },
      { name: 'historiaProblema', label: 'História do Problema Atual', type: 'textarea' },
      { name: 'historicoFamiliar', label: 'Histórico Familiar', type: 'textarea' },
      { name: 'medicamentos', label: 'Medicamentos em Uso', type: 'textarea' },
      { name: 'expectativas', label: 'Expectativas com o Tratamento', type: 'textarea' }
    ]
  },
  'BAI (Ansiedade)': {
    fields: [
      { name: 'dormencia', label: 'Dormência ou formigamento', type: 'select', options: ['0 - Absolutamente não', '1 - Levemente', '2 - Moderadamente', '3 - Gravemente'] },
      { name: 'sensacaoCalor', label: 'Sensação de calor', type: 'select', options: ['0 - Absolutamente não', '1 - Levemente', '2 - Moderadamente', '3 - Gravemente'] },
      { name: 'tremoresPernas', label: 'Tremores nas pernas', type: 'select', options: ['0 - Absolutamente não', '1 - Levemente', '2 - Moderadamente', '3 - Gravemente'] },
      { name: 'incapazRelaxar', label: 'Incapaz de relaxar', type: 'select', options: ['0 - Absolutamente não', '1 - Levemente', '2 - Moderadamente', '3 - Gravemente'] },
      { name: 'medoPiorAcontecer', label: 'Medo de que o pior aconteça', type: 'select', options: ['0 - Absolutamente não', '1 - Levemente', '2 - Moderadamente', '3 - Gravemente'] },
      { name: 'atordoado', label: 'Atordoado ou tonto', type: 'select', options: ['0 - Absolutamente não', '1 - Levemente', '2 - Moderadamente', '3 - Gravemente'] },
      { name: 'palpitacao', label: 'Palpitação ou aceleração do coração', type: 'select', options: ['0 - Absolutamente não', '1 - Levemente', '2 - Moderadamente', '3 - Gravemente'] }
    ]
  },
  'BDI (Depressão)': {
    fields: [
      { name: 'tristeza', label: 'Tristeza', type: 'select', options: ['0 - Não me sinto triste', '1 - Eu me sinto triste', '2 - Estou sempre triste', '3 - Estou tão triste que não consigo suportar'] },
      { name: 'pessimismo', label: 'Pessimismo', type: 'select', options: ['0 - Não estou desanimado', '1 - Eu me sinto desanimado', '2 - Acho que nada tenho a esperar', '3 - Acho o futuro sem esperança'] },
      { name: 'sensacaoFracasso', label: 'Sensação de fracasso', type: 'select', options: ['0 - Não me sinto um fracasso', '1 - Acho que fracassei mais que a maioria', '2 - Sinto que cometi muitos fracassos', '3 - Acho que sou um completo fracasso'] },
      { name: 'faltaSatisfacao', label: 'Falta de satisfação', type: 'select', options: ['0 - Tenho satisfação em tudo como antes', '1 - Não sinto mais satisfação com as coisas', '2 - Não consigo sentir satisfação real', '3 - Estou insatisfeito ou aborrecido'] },
      { name: 'sensacaoCulpa', label: 'Sensação de culpa', type: 'select', options: ['0 - Não me sinto culpado', '1 - Eu me sinto culpado às vezes', '2 - Eu me sinto culpado na maior parte do tempo', '3 - Eu me sinto sempre culpado'] },
      { name: 'sensacaoPunicao', label: 'Sensação de punição', type: 'select', options: ['0 - Não acho que esteja sendo punido', '1 - Acho que posso ser punido', '2 - Creio que vou ser punido', '3 - Acho que estou sendo punido'] }
    ]
  },
  'TCC': {
    fields: [
      { name: 'situacaoProblema', label: 'Situação/Problema', type: 'textarea' },
      { name: 'pensamentosAutomaticos', label: 'Pensamentos Automáticos', type: 'textarea' },
      { name: 'emocoes', label: 'Emoções (0-100)', type: 'textarea' },
      { name: 'comportamentos', label: 'Comportamentos', type: 'textarea' },
      { name: 'sensacoesFisicas', label: 'Sensações Físicas', type: 'textarea' },
      { name: 'evidenciasContra', label: 'Evidências Contra o Pensamento', type: 'textarea' },
      { name: 'evidenciasA_favor', label: 'Evidências a Favor do Pensamento', type: 'textarea' },
      { name: 'pensamentoEquilibrado', label: 'Pensamento Mais Equilibrado', type: 'textarea' },
      { name: 'novaEmocao', label: 'Nova Emoção (0-100)', type: 'textarea' }
    ]
  },
  'Infantil': {
    fields: [
      { name: 'nomeCrianca', label: 'Nome da Criança', type: 'text' },
      { name: 'idadeCrianca', label: 'Idade', type: 'number' },
      { name: 'nomeResponsavel', label: 'Nome do Responsável', type: 'text' },
      { name: 'parentesco', label: 'Parentesco', type: 'text' },
      { name: 'motivoConsulta', label: 'Motivo da Consulta', type: 'textarea' },
      { name: 'desenvolvimentoMotor', label: 'Desenvolvimento Motor', type: 'textarea' },
      { name: 'desenvolvimentoLinguagem', label: 'Desenvolvimento da Linguagem', type: 'textarea' },
      { name: 'comportamentoEscola', label: 'Comportamento na Escola', type: 'textarea' },
      { name: 'relacionamentoFamilia', label: 'Relacionamento Familiar', type: 'textarea' },
      { name: 'brincadeirasPreferidas', label: 'Brincadeiras Preferidas', type: 'textarea' },
      { name: 'medosPreocupacoes', label: 'Medos e Preocupações', type: 'textarea' }
    ]
  }
}

export default function MindCare() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [clients, setClients] = useState<Client[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [user, setUser] = useState<User>({ 
    name: 'Dr. João Silva', 
    email: 'joao@mindcare.com', 
    timezone: 'America/Sao_Paulo',
    currentPlan: 'pro',
    planStatus: 'active',
    nextBilling: '2024-04-15'
  })
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [showNewSessionForm, setShowNewSessionForm] = useState(false)
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false)
  const [showCancelSubscription, setShowCancelSubscription] = useState(false)
  const [showUpgradePlan, setShowUpgradePlan] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientDetailTab, setClientDetailTab] = useState('dados-gerais')
  const [showNewFichaForm, setShowNewFichaForm] = useState(false)
  const [showNewNotaForm, setShowNewNotaForm] = useState(false)
  const [showNewEvolucaoForm, setShowNewEvolucaoForm] = useState(false)
  const [selectedFichaType, setSelectedFichaType] = useState<string>('')
  const [fichaData, setFichaData] = useState<any>({})
  const [notas, setNotas] = useState<Nota[]>([])
  const [evolucaoEntries, setEvolucaoEntries] = useState<EvolucaoEntry[]>([])
  const [newNota, setNewNota] = useState('')
  const [newEvolucao, setNewEvolucao] = useState({ sintomaPrincipal: '', nota: 5 })
  const [showPasswordLogin, setShowPasswordLogin] = useState(false)
  const [showPasswordRegister, setShowPasswordRegister] = useState(false)
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false)
  const [showPasswordNew, setShowPasswordNew] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [fichasSalvas, setFichasSalvas] = useState<Ficha[]>([])
  const [editingNota, setEditingNota] = useState<string | null>(null)
  const [editNotaContent, setEditNotaContent] = useState('')
  const [loginMode, setLoginMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [newClient, setNewClient] = useState({ 
    name: '', 
    age: '', 
    phone: '', 
    email: '', 
    emergencyPhone: '', 
    gender: '', 
    birthDate: '', 
    mainProblem: '' 
  })
  const [newSession, setNewSession] = useState({ 
    clientId: '', 
    date: '', 
    time: '', 
    type: 'online' as 'online' | 'presencial', 
    status: 'agendada' as 'agendada' | 'confirmada' | 'cancelada' | 'faltou' 
  })
  const [registerData, setRegisterData] = useState({
    name: '',
    fullName: '',
    phone: '',
    email: '',
    password: ''
  })
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Estados temporários para configurações (antes de salvar)
  const [tempUser, setTempUser] = useState<User>({ 
    name: 'Dr. João Silva', 
    email: 'joao@mindcare.com', 
    timezone: 'America/Sao_Paulo',
    currentPlan: 'pro',
    planStatus: 'active',
    nextBilling: '2024-04-15'
  })
  const [tempNotifications, setTempNotifications] = useState({
    email: true,
    sessoes: true,
    relatorios: true
  })

  // Verificar sessão do Supabase ao carregar
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setIsAuthenticated(true)
      setUser({
        ...user,
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
        email: session.user.email || ''
      })
      setTempUser({
        ...tempUser,
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
        email: session.user.email || ''
      })
    }
  }

  // Verificar se recurso está disponível no plano
  const canUseFeature = (feature: keyof Plan['features']): boolean => {
    const currentPlan = plans[user.currentPlan]
    return currentPlan.features[feature] as boolean
  }

  // Verificar limite de clientes
  const canAddClient = (): boolean => {
    const currentPlan = plans[user.currentPlan]
    if (currentPlan.features.maxClients === 'unlimited') return true
    return clients.length < currentPlan.features.maxClients
  }

  // Função para mostrar mensagem de sucesso
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Função de login com Supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })

      if (error) {
        setAuthError(error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : error.message)
        setAuthLoading(false)
        return
      }

      if (data.user) {
        setIsAuthenticated(true)
        setUser({
          ...user,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
          email: data.user.email || ''
        })
        setTempUser({
          ...tempUser,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
          email: data.user.email || ''
        })
      }
    } catch (err) {
      setAuthError('Erro ao fazer login. Tente novamente.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Função de cadastro com Supabase
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    
    // Validar campos obrigatórios
    if (!registerData.name || !registerData.email || !registerData.password) {
      setAuthError('Todos os campos são obrigatórios!')
      setAuthLoading(false)
      return
    }
    
    if (registerData.password.length < 6) {
      setAuthError('A senha deve ter pelo menos 6 caracteres!')
      setAuthLoading(false)
      return
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            phone: registerData.phone
          }
        }
      })

      if (error) {
        setAuthError(error.message)
        setAuthLoading(false)
        return
      }

      if (data.user) {
        // Login automático após cadastro
        setIsAuthenticated(true)
        setUser({
          ...user,
          name: registerData.name,
          email: registerData.email
        })
        setTempUser({
          ...tempUser,
          name: registerData.name,
          email: registerData.email
        })
        
        // Limpar formulário
        setRegisterData({ name: '', fullName: '', phone: '', email: '', password: '' })
        showSuccessMessage('Cadastro realizado com sucesso!')
      }
    } catch (err) {
      setAuthError('Erro ao criar conta. Tente novamente.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Função de esqueci minha senha com Supabase
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/alterar-senha`
      })

      if (error) {
        setAuthError(error.message)
        setAuthLoading(false)
        return
      }

      showSuccessMessage('Link de redefinição enviado para seu email!')
      setLoginMode('login')
      setForgotPasswordEmail('')
    } catch (err) {
      setAuthError('Erro ao enviar email. Tente novamente.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Função de logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setUser({
      name: 'Dr. João Silva',
      email: 'joao@mindcare.com',
      timezone: 'America/Sao_Paulo',
      currentPlan: 'pro',
      planStatus: 'active',
      nextBilling: '2024-04-15'
    })
  }

  // Função para adicionar cliente - CORRIGIDA para calcular idade automaticamente
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar limite de clientes
    if (!canAddClient()) {
      alert(`Você atingiu o limite de ${plans[user.currentPlan].features.maxClients} clientes do seu plano. Faça upgrade para adicionar mais clientes!`)
      return
    }
    
    const calculatedAge = calculateAge(newClient.birthDate)
    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name,
      age: calculatedAge,
      phone: newClient.phone,
      email: newClient.email,
      emergencyPhone: newClient.emergencyPhone,
      gender: newClient.gender,
      birthDate: newClient.birthDate,
      mainProblem: newClient.mainProblem,
      createdAt: getLocalDateString()
    }
    setClients([...clients, client])
    setNewClient({ 
      name: '', 
      age: '', 
      phone: '', 
      email: '', 
      emergencyPhone: '', 
      gender: '', 
      birthDate: '', 
      mainProblem: '' 
    })
    setShowNewClientForm(false)
    showSuccessMessage('Cliente cadastrado com sucesso!')
  }

  // Função para adicionar sessão - CORRIGIDA para usar data exata selecionada
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar se tem permissão para agendar
    if (!canUseFeature('scheduling')) {
      alert('Agendamento de sessões não está disponível no seu plano!')
      return
    }
    
    const client = clients.find(c => c.id === newSession.clientId)
    if (client) {
      const session: Session = {
        id: Date.now().toString(),
        clientId: newSession.clientId,
        clientName: client.name,
        date: newSession.date, // Mantém a data EXATAMENTE como foi selecionada
        time: newSession.time,
        type: newSession.type,
        status: newSession.status
      }
      setSessions([...sessions, session])
      setNewSession({ 
        clientId: '', 
        date: '', 
        time: '', 
        type: 'online', 
        status: 'agendada' 
      })
      setShowNewSessionForm(false)
      showSuccessMessage('Sessão agendada com sucesso!')
    }
  }

  // Função para deletar cliente
  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(c => c.id !== clientId))
    setSessions(sessions.filter(s => s.clientId !== clientId))
  }

  // Função para confirmar sessão
  const handleConfirmSession = (sessionId: string) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'confirmada' as const }
        : session
    ))
  }

  // Função para cancelar sessão
  const handleCancelSession = (sessionId: string) => {
    setSessions(sessions.filter(session => session.id !== sessionId))
  }

  // Função para salvar configurações de PERFIL - ATUALIZADA para salvar no localStorage
  const handleSaveProfileSettings = () => {
    setUser(tempUser)
    showSuccessMessage('Configurações de Perfil salvas com sucesso!')
  }

  // Função para salvar configurações de NOTIFICAÇÕES
  const handleSaveNotificationSettings = () => {
    showSuccessMessage('Configurações de Notificações salvas com sucesso!')
  }

  // Função para alterar senha
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('As senhas não coincidem!')
      return
    }
    if (securityData.newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres!')
      return
    }
    showSuccessMessage('Senha alterada com sucesso!')
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  // Função para cancelar assinatura
  const handleCancelSubscription = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Solicitação de cancelamento enviada. Motivo: ${cancelReason}`)
    setShowCancelSubscription(false)
    setCancelReason('')
  }

  // Função para fazer upgrade de plano
  const handleUpgradePlan = (newPlan: PlanType) => {
    setUser({ ...user, currentPlan: newPlan })
    setTempUser({ ...tempUser, currentPlan: newPlan })
    showSuccessMessage(`Plano atualizado para ${plans[newPlan].name} com sucesso!`)
    setShowUpgradePlan(false)
  }

  // Função para ver detalhes do cliente
  const handleViewClientDetails = (client: Client) => {
    setSelectedClient(client)
    setClientDetailTab('dados-gerais')
    setIsMobileMenuOpen(false)
  }

  // Função para selecionar tipo de ficha
  const handleSelectFichaType = (type: string) => {
    // Verificar se tem permissão para usar templates
    if (!canUseFeature('templates')) {
      alert('Modelos de fichas prontas não estão disponíveis no seu plano. Faça upgrade para o Plano Pro ou Infinity!')
      return
    }
    setSelectedFichaType(type)
    setFichaData({})
  }

  // Função para salvar ficha - CORRIGIDA para usar data local
  const handleSaveFicha = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return
    
    const novaFicha: Ficha = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      type: selectedFichaType as 'Anamnese' | 'BAI (Ansiedade)' | 'BDI (Depressão)' | 'TCC' | 'Infantil',
      createdAt: new Date().toISOString(), // Mantém ISO para timestamp completo
      data: fichaData
    }
    
    setFichasSalvas([...fichasSalvas, novaFicha])
    showSuccessMessage(`Ficha de ${selectedFichaType} salva com sucesso!`)
    setShowNewFichaForm(false)
    setSelectedFichaType('')
    setFichaData({})
  }

  // Função para editar ficha
  const handleEditFicha = (ficha: Ficha) => {
    setSelectedFichaType(ficha.type)
    setFichaData(ficha.data)
    setShowNewFichaForm(true)
  }

  // Função para deletar ficha
  const handleDeleteFicha = (fichaId: string) => {
    setFichasSalvas(fichasSalvas.filter(f => f.id !== fichaId))
    showSuccessMessage('Ficha deletada com sucesso!')
  }

  // Função para adicionar nota
  const handleAddNota = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient || !newNota.trim()) return

    const nota: Nota = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      content: newNota,
      createdAt: new Date().toISOString()
    }
    
    setNotas([...notas, nota])
    setNewNota('')
    setShowNewNotaForm(false)
    showSuccessMessage('Nota adicionada com sucesso!')
  }

  // Função para deletar nota
  const handleDeleteNota = (notaId: string) => {
    setNotas(notas.filter(n => n.id !== notaId))
    showSuccessMessage('Nota deletada com sucesso!')
  }

  // Função para editar nota
  const handleEditNota = (nota: Nota) => {
    setEditingNota(nota.id)
    setEditNotaContent(nota.content)
  }

  // Função para salvar edição da nota
  const handleSaveEditNota = (notaId: string) => {
    setNotas(notas.map(n => 
      n.id === notaId 
        ? { ...n, content: editNotaContent }
        : n
    ))
    setEditingNota(null)
    setEditNotaContent('')
    showSuccessMessage('Nota editada com sucesso!')
  }

  // Função para cancelar edição da nota
  const handleCancelEditNota = () => {
    setEditingNota(null)
    setEditNotaContent('')
  }

  // Função para adicionar entrada de evolução
  const handleAddEvolucao = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return
    
    // Verificar se tem permissão para usar gráfico de evolução
    if (!canUseFeature('evolution')) {
      alert('Gráfico de evolução não está disponível no seu plano. Faça upgrade para o Plano Infinity!')
      return
    }

    const evolucaoEntry: EvolucaoEntry = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      sintomaPrincipal: newEvolucao.sintomaPrincipal,
      nota: newEvolucao.nota,
      createdAt: new Date().toISOString()
    }
    
    setEvolucaoEntries([...evolucaoEntries, evolucaoEntry])
    setNewEvolucao({ sintomaPrincipal: '', nota: 5 })
    setShowNewEvolucaoForm(false)
    showSuccessMessage('Entrada de evolução adicionada com sucesso!')
  }

  // Função para deletar entrada de evolução
  const handleDeleteEvolucao = (evolucaoId: string) => {
    setEvolucaoEntries(evolucaoEntries.filter(e => e.id !== evolucaoId))
    showSuccessMessage('Sintoma excluído com sucesso!')
  }

  // Filtrar clientes por busca
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  // Obter sessões de HOJE (data atual)
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.date + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    sessionDate.setHours(0, 0, 0, 0)
    return sessionDate.getTime() === today.getTime() && (session.status === 'agendada' || session.status === 'confirmada')
  }).slice(0, 3)

  // Obter clientes recentes (SEM data de criação) - ATUALIZADO para mostrar idade calculada
  const recentClients = clients.slice(-3).reverse().map(client => ({
    ...client,
    age: calculateAge(client.birthDate)
  }))

  // Estatísticas do dashboard
  const totalClients = clients.length
  const weekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return sessionDate >= weekAgo
  }).length
  const missedSessions = sessions.filter(s => s.status === 'faltou').length

  // Função para gerar calendário real
  const generateCalendar = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  // Obter notas do cliente selecionado
  const clientNotas = selectedClient ? notas.filter(n => n.clientId === selectedClient.id) : []

  // Obter entradas de evolução do cliente selecionado
  const clientEvolucao = selectedClient ? evolucaoEntries.filter(e => e.clientId === selectedClient.id) : []

  // Obter fichas salvas do cliente selecionado
  const clientFichas = selectedClient ? fichasSalvas.filter(f => f.clientId === selectedClient.id) : []

  // Cores para diferentes sintomas no gráfico
  const sintomaColors = [
    '#3B82F6', // blue-600
    '#EF4444', // red-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#6366F1'  // indigo-500
  ]

  // Função para criar gráfico de LINHA
  const renderLineChart = () => {
    if (clientEvolucao.length === 0) return null

    const chartHeight = 300
    const chartWidth = 700
    const padding = { top: 30, right: 50, bottom: 80, left: 70 }

    // Agrupar sintomas únicos para cores consistentes
    const sintomasUnicos = [...new Set(clientEvolucao.map(e => e.sintomaPrincipal))]
    const getCorSintoma = (sintoma: string) => {
      const index = sintomasUnicos.indexOf(sintoma)
      return sintomaColors[index % sintomaColors.length]
    }

    // Agrupar dados por sintoma
    const dadosPorSintoma: { [key: string]: EvolucaoEntry[] } = {}
    clientEvolucao.forEach(entry => {
      if (!dadosPorSintoma[entry.sintomaPrincipal]) {
        dadosPorSintoma[entry.sintomaPrincipal] = []
      }
      dadosPorSintoma[entry.sintomaPrincipal].push(entry)
    })

    // Ordenar cada sintoma por data
    Object.keys(dadosPorSintoma).forEach(sintoma => {
      dadosPorSintoma[sintoma].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    })

    // Calcular posições dos pontos
    const getX = (index: number, total: number) => {
      const availableWidth = chartWidth - padding.left - padding.right
      return padding.left + (index / (total - 1 || 1)) * availableWidth
    }

    const getY = (nota: number) => {
      const availableHeight = chartHeight - padding.top - padding.bottom
      return chartHeight - padding.bottom - (nota / 10) * availableHeight
    }

    return (
      <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-8 rounded-2xl border-2 border-gray-100 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <LineChart className="text-blue-600" size={24} />
            Gráfico de Evolução Temporal
          </h4>
        </div>
        
        <div className="relative bg-white p-4 sm:p-6 rounded-xl border border-gray-200 overflow-x-auto" style={{ minHeight: chartHeight }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
            {/* Grid horizontal */}
            {[0, 2, 4, 6, 8, 10].map(value => {
              const y = getY(value)
              return (
                <g key={value}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke={value === 0 ? "#9CA3AF" : "#E5E7EB"}
                    strokeWidth={value === 0 ? "2" : "1"}
                    strokeDasharray={value === 0 ? "none" : "4,4"}
                  />
                  <text
                    x={padding.left - 15}
                    y={y + 5}
                    fontSize="14"
                    fontWeight="600"
                    fill="#6B7280"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                </g>
              )
            })}

            {/* Eixo Y */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={chartHeight - padding.bottom}
              stroke="#9CA3AF"
              strokeWidth="2"
            />

            {/* Eixo X */}
            <line
              x1={padding.left}
              y1={chartHeight - padding.bottom}
              x2={chartWidth - padding.right}
              y2={chartHeight - padding.bottom}
              stroke="#9CA3AF"
              strokeWidth="2"
            />

            {/* Linhas e pontos para cada sintoma */}
            {Object.entries(dadosPorSintoma).map(([sintoma, entries]) => {
              const cor = getCorSintoma(sintoma)
              
              // Criar path da linha
              const pathData = entries.map((entry, index) => {
                const x = getX(index, entries.length)
                const y = getY(entry.nota)
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
              }).join(' ')

              return (
                <g key={sintoma}>
                  {/* Linha conectando os pontos */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={cor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Pontos */}
                  {entries.map((entry, index) => {
                    const x = getX(index, entries.length)
                    const y = getY(entry.nota)
                    
                    return (
                      <g key={entry.id}>
                        {/* Círculo externo (borda) */}
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill="white"
                          stroke={cor}
                          strokeWidth="3"
                          className="cursor-pointer hover:r-10 transition-all"
                        />
                        {/* Círculo interno */}
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill={cor}
                          className="cursor-pointer"
                        />
                        
                        {/* Tooltip */}
                        <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                          <rect
                            x={x - 60}
                            y={y - 60}
                            width="120"
                            height="50"
                            fill="#1F2937"
                            rx="8"
                          />
                          <text
                            x={x}
                            y={y - 40}
                            fontSize="12"
                            fontWeight="600"
                            fill="white"
                            textAnchor="middle"
                          >
                            {sintoma}
                          </text>
                          <text
                            x={x}
                            y={y - 25}
                            fontSize="11"
                            fill="white"
                            textAnchor="middle"
                          >
                            Nota: {entry.nota}/10
                          </text>
                          <text
                            x={x}
                            y={y - 12}
                            fontSize="10"
                            fill="#D1D5DB"
                            textAnchor="middle"
                          >
                            {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                          </text>
                        </g>
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Legenda de sintomas */}
        {sintomasUnicos.length > 1 && (
          <div className="mt-6 pt-6 border-t-2 border-gray-100">
            <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded"></div>
              Sintomas Monitorados:
            </h5>
            <div className="flex flex-wrap gap-3">
              {sintomasUnicos.map((sintoma, index) => (
                <div key={sintoma} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: sintomaColors[index % sintomaColors.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{sintoma}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
          <div className="text-center mb-8">
            {/* Logo do Cérebro */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Brain className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">MindCare</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {loginMode === 'login' && 'Faça login para continuar'}
              {loginMode === 'register' && 'Crie sua conta'}
              {loginMode === 'forgot' && 'Redefinir senha'}
            </p>
          </div>

          {/* Mensagem de Erro */}
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm text-center">{authError}</p>
            </div>
          )}
          
          {/* Formulário de Login */}
          {loginMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="seu@email.com"
                  required
                  disabled={authLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showPasswordLogin ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="••••••••"
                    required
                    disabled={authLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={authLoading}
                  >
                    {showPasswordLogin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* Formulário de Cadastro */}
          {loginMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Seu nome completo"
                  required
                  disabled={authLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Telefone</label>
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="(11) 99999-9999"
                  disabled={authLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="seu@email.com"
                  required
                  disabled={authLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha *</label>
                <div className="relative">
                  <input
                    type={showPasswordRegister ? "text" : "password"}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="••••••••"
                    required
                    disabled={authLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={authLoading}
                  >
                    {showPasswordRegister ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Cadastrando...' : 'Cadastrar-se'}
              </button>
            </form>
          )}

          {/* Formulário de Esqueci Minha Senha */}
          {loginMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail de Login</label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="seu@email.com"
                  required
                  disabled={authLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Enviando...' : 'Enviar Link'}
              </button>
            </form>
          )}

          {/* Opções de navegação */}
          <div className="mt-6 space-y-3">
            {loginMode === 'login' && (
              <>
                <button 
                  onClick={() => {
                    setLoginMode('register')
                    setAuthError('')
                  }}
                  className="w-full text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                  disabled={authLoading}
                >
                  Cadastrar-se
                </button>
                <button 
                  onClick={() => {
                    setLoginMode('forgot')
                    setAuthError('')
                  }}
                  className="w-full text-gray-600 hover:text-gray-700 transition-colors text-sm"
                  disabled={authLoading}
                >
                  Esqueci minha senha
                </button>
              </>
            )}
            
            {(loginMode === 'register' || loginMode === 'forgot') && (
              <button 
                onClick={() => {
                  setLoginMode('login')
                  setAuthError('')
                }}
                className="w-full text-gray-600 hover:text-gray-700 transition-colors text-sm"
                disabled={authLoading}
              >
                Voltar ao login
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Se um cliente está selecionado, mostrar detalhes
  if (selectedClient) {
    // Recalcular idade do cliente selecionado
    const clientAge = calculateAge(selectedClient.birthDate)
    
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Menu Lateral Desktop */}
        <div className="hidden lg:flex w-64 bg-white shadow-lg flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">MindCare</h1>
            </div>
          </div>
          
          <nav className="flex-1 p-4">
            <button
              onClick={() => setSelectedClient(null)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-600 hover:bg-gray-100 mb-4"
            >
              <ChevronLeft size={20} />
              Voltar aos Clientes
            </button>
          </nav>
        </div>

        {/* Conteúdo Principal - Detalhes do Cliente */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Cabeçalho Mobile/Desktop */}
          <header className="bg-white shadow-sm border-b px-4 sm:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Botão Voltar Mobile */}
              <button
                onClick={() => setSelectedClient(null)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-base sm:text-lg">
                {selectedClient.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">{selectedClient.name}</h2>
                <p className="text-sm text-gray-600">{clientAge} anos • {selectedClient.gender}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </header>

          {/* Abas - Scroll Horizontal Mobile */}
          <div className="bg-white border-b px-4 sm:px-6 overflow-x-auto">
            <div className="flex space-x-4 sm:space-x-8 min-w-max">
              {[
                { id: 'dados-gerais', label: 'Dados Gerais', icon: User },
                { id: 'fichas', label: 'Fichas', icon: FileText },
                { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
                { id: 'notas', label: 'Notas', icon: StickyNote }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setClientDetailTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                      clientDetailTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm sm:text-base">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Conteúdo das Abas - Scroll Vertical */}
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            {/* Dados Gerais */}
            {clientDetailTab === 'dados-gerais' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Informações Pessoais</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedClient.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                      <p className="text-sm sm:text-base text-gray-900">{clientAge} anos</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedClient.gender}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                      <p className="text-sm sm:text-base text-gray-900">{new Date(selectedClient.birthDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone de Emergência</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedClient.emergencyPhone}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                      <p className="text-sm sm:text-base text-gray-900 break-all">{selectedClient.email}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Problema Principal</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedClient.mainProblem}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fichas */}
            {clientDetailTab === 'fichas' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Fichas do Cliente</h3>
                  <button
                    onClick={() => {
                      if (!canUseFeature('templates')) {
                        alert('Modelos de fichas prontas não estão disponíveis no seu plano. Faça upgrade para o Plano Pro ou Infinity!')
                        return
                      }
                      setShowNewFichaForm(true)
                    }}
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={20} />
                    Nova Ficha
                  </button>
                </div>
                
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  {clientFichas.length > 0 ? (
                    <div className="space-y-4">
                      {clientFichas.map(ficha => (
                        <div key={ficha.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-800 text-sm sm:text-base">{ficha.type}</h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditFicha(ficha)}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                                title="Editar ficha"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteFicha(ficha.id)}
                                className="text-red-600 hover:text-red-700 transition-colors"
                                title="Deletar ficha"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs sm:text-sm text-gray-600">Ficha preenchida e salva</p>
                            <span className="text-xs sm:text-sm text-gray-500">
                              {new Date(ficha.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">Nenhuma ficha criada ainda. Clique em "Nova Ficha" para começar.</p>
                  )}</div>
              </div>
            )}

            {/* Evolução */}
            {clientDetailTab === 'evolucao' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Evolução do Cliente</h3>
                  <button
                    onClick={() => {
                      if (!canUseFeature('evolution')) {
                        alert('Gráfico de evolução não está disponível no seu plano. Faça upgrade para o Plano Infinity!')
                        return
                      }
                      setShowNewEvolucaoForm(true)
                    }}
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={20} />
                    Nova Entrada
                  </button>
                </div>
                
                {/* Gráfico de Evolução - APENAS LINHA */}
                {canUseFeature('evolution') ? (
                  <>
                    {clientEvolucao.length > 0 && renderLineChart()}
                    
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                      {clientEvolucao.length > 0 ? (
                        <div className="space-y-4">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Histórico de Entradas</h4>
                          {clientEvolucao.map(entry => (
                            <div key={entry.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-800 text-sm sm:text-base">{entry.sintomaPrincipal}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteEvolucao(entry.id)}
                                    className="text-red-600 hover:text-red-700 transition-colors"
                                    title="Excluir sintoma"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm text-gray-600">Intensidade:</span>
                                <div className="flex items-center gap-1 flex-1">
                                  <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${(entry.nota / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-800">{entry.nota}/10</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <LineChart className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500 text-sm">Nenhuma entrada de evolução ainda</p>
                            <p className="text-xs sm:text-sm text-gray-400 mt-2">Clique em "Nova Entrada" para começar</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 sm:p-8 shadow-sm border-2 border-purple-200">
                    <div className="text-center">
                      <Crown className="mx-auto text-purple-600 mb-4" size={48} />
                      <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Recurso Premium</h4>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        O gráfico de evolução está disponível apenas no Plano Infinity
                      </p>
                      <button
                        onClick={() => setShowUpgradePlan(true)}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                      >
                        Fazer Upgrade
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notas */}
            {clientDetailTab === 'notas' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notas do Cliente</h3>
                  <button 
                    onClick={() => setShowNewNotaForm(true)}
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={20} />
                    Nova Nota
                  </button>
                </div>
                
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  {clientNotas.length > 0 ? (
                    <div className="space-y-4">
                      {clientNotas.map(nota => (
                        <div key={nota.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs sm:text-sm text-gray-500">
                              {new Date(nota.createdAt).toLocaleDateString('pt-BR')} às {new Date(nota.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditNota(nota)}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                                title="Editar nota"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteNota(nota.id)}
                                className="text-red-600 hover:text-red-700 transition-colors"
                                title="Deletar nota"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          {editingNota === nota.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editNotaContent}
                                onChange={(e) => setEditNotaContent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEditNota(nota.id)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs sm:text-sm hover:bg-blue-700 transition-colors"
                                >
                                  Salvar
                                </button>
                                <button
                                  onClick={handleCancelEditNota}
                                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs sm:text-sm hover:bg-gray-200 transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm sm:text-base text-gray-800">{nota.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">Nenhuma nota adicionada ainda.</p>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Modal Nova Ficha */}
        {showNewFichaForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                {selectedFichaType ? `Ficha: ${selectedFichaType}` : 'Selecionar Tipo de Ficha'}
              </h3>
              
              {!selectedFichaType ? (
                <div className="space-y-3">
                  {['Anamnese', 'BAI (Ansiedade)', 'BDI (Depressão)', 'TCC', 'Infantil'].map(type => (
                    <button
                      key={type}
                      onClick={() => handleSelectFichaType(type)}
                      className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-800 text-sm sm:text-base"
                    >
                      {type}
                    </button>
                  ))}
                  
                  <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowNewFichaForm(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveFicha} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fichaModels[selectedFichaType as keyof typeof fichaModels]?.fields.map(field => (
                      <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                        </label>
                        {field.type === 'text' && (
                          <input
                            type="text"
                            value={fichaData[field.name] || ''}
                            onChange={(e) => setFichaData({...fichaData, [field.name]: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        )}
                        {field.type === 'number' && (
                          <input
                            type="number"
                            value={fichaData[field.name] || ''}
                            onChange={(e) => setFichaData({...fichaData, [field.name]: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        )}
                        {field.type === 'select' && (
                          <select
                            value={fichaData[field.name] || ''}
                            onChange={(e) => setFichaData({...fichaData, [field.name]: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Selecione...</option>
                            {field.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                        {field.type === 'textarea' && (
                          <textarea
                            value={fichaData[field.name] || ''}
                            onChange={(e) => setFichaData({...fichaData, [field.name]: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            rows={3}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFichaType('')
                        setFichaData({})
                      }}
                      className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewFichaForm(false)
                        setSelectedFichaType('')
                        setFichaData({})
                      }}
                      className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Salvar Ficha
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal Nova Nota */}
        {showNewNotaForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Nova Nota</h3>
              
              <form onSubmit={handleAddNota} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Anotação</label>
                  <textarea
                    value={newNota}
                    onChange={(e) => setNewNota(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    rows={6}
                    placeholder="Escreva sua anotação sobre o paciente..."
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewNotaForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Salvar Nota
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Nova Evolução */}
        {showNewEvolucaoForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Nova Entrada de Evolução</h3>
              
              <form onSubmit={handleAddEvolucao} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sintoma Principal</label>
                  <input
                    type="text"
                    value={newEvolucao.sintomaPrincipal}
                    onChange={(e) => setNewEvolucao({...newEvolucao, sintomaPrincipal: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Ex: Ansiedade, Depressão, Estresse..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensidade do Problema (0-10): {newEvolucao.nota}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={newEvolucao.nota}
                    onChange={(e) => setNewEvolucao({...newEvolucao, nota: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0 - Nenhum problema</span>
                    <span>10 - Problema máximo</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewEvolucaoForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Menu Lateral Desktop */}
      <div className="hidden lg:flex w-64 bg-white shadow-lg flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Brain className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">MindCare</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentView === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            
            <button
              onClick={() => setCurrentView('clients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentView === 'clients' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users size={20} />
              Clientes
            </button>
            
            <button
              onClick={() => setCurrentView('agenda')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentView === 'agenda' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar size={20} />
              Agenda
            </button>
            
            <button
              onClick={() => setCurrentView('subscription')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentView === 'subscription' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CreditCard size={20} />
              Assinatura
            </button>
            
            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentView === 'settings' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
              Configurações
            </button>
          </div>
        </nav>
      </div>

      {/* Menu Mobile - Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-xs">Dashboard</span>
          </button>
          
          <button
            onClick={() => setCurrentView('clients')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'clients' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Users size={20} />
            <span className="text-xs">Clientes</span>
          </button>
          
          <button
            onClick={() => setCurrentView('agenda')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'agenda' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Calendar size={20} />
            <span className="text-xs">Agenda</span>
          </button>
          
          <button
            onClick={() => setCurrentView('subscription')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'subscription' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <CreditCard size={20} />
            <span className="text-xs">Assinatura</span>
          </button>
          
          <button
            onClick={() => setCurrentView('settings')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'settings' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Settings size={20} />
            <span className="text-xs">Config</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <header className="bg-white shadow-sm border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="text-xs sm:text-sm text-gray-600">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline text-sm">Sair</span>
          </button>
        </header>

        {/* Mensagem de Sucesso */}
        {successMessage && (
          <div className="bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 text-center text-sm">
            {successMessage}
          </div>
        )}

        {/* Área de Conteúdo - Com padding bottom para mobile menu */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20 lg:pb-6">
          {/* Dashboard */}
          {currentView === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header de Boas-vindas - NOME DINÂMICO */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 sm:p-6 text-white">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Bem-vindo(a), {user.name} 👋</h2>
                <p className="text-sm sm:text-base text-blue-100">Aqui está um resumo das suas atividades.</p>
              </div>

              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-gray-600 text-xs sm:text-sm">Total de Clientes</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totalClients}</p>
                      {plans[user.currentPlan].features.maxClients !== 'unlimited' && (
                        <p className="text-gray-500 text-xs sm:text-sm">
                          Limite: {plans[user.currentPlan].features.maxClients}
                        </p>
                      )}
                    </div>
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-gray-600 text-xs sm:text-sm">Sessões da Semana</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-800">{weekSessions}</p>
                      <p className="text-green-600 text-xs sm:text-sm">+1 vs semana anterior</p>
                    </div>
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-gray-600 text-xs sm:text-sm">Sessões Perdidas</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-800">{missedSessions}</p>
                      <p className="text-red-600 text-xs sm:text-sm">Este mês</p>
                    </div>
                    <Clock className="text-red-600" size={24} />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-gray-600 text-xs sm:text-sm">Sessões de Hoje</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-800">{todaySessions.length}</p>
                      <p className="text-blue-600 text-xs sm:text-sm">Agendadas para hoje</p>
                    </div>
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Sessões de Hoje */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Sessões de Hoje</h3>
                  {todaySessions.length > 0 ? (
                    <div className="space-y-3">
                      {todaySessions.map(session => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800 text-sm sm:text-base">{session.clientName}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{session.time} - {session.type}</p>
                          </div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">Nenhuma sessão agendada para hoje.</p>
                  )}
                </div>

                {/* Clientes Recentes - SEM DATA DE CRIAÇÃO, COM IDADE CALCULADA */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Clientes Recentes</h3>
                  {recentClients.length > 0 ? (
                    <div className="space-y-3">
                      {recentClients.map(client => (
                        <div key={client.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {client.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm sm:text-base">{client.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{client.age} anos • {client.gender}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">Nenhum cliente cadastrado ainda.</p>
                  )}
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      if (!canAddClient()) {
                        alert(`Você atingiu o limite de ${plans[user.currentPlan].features.maxClients} clientes do seu plano. Faça upgrade para adicionar mais clientes!`)
                        return
                      }
                      setShowNewClientForm(true)
                    }}
                    className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="text-blue-600" size={24} />
                    <span className="font-medium text-blue-600 text-sm sm:text-base">Criar Pasta</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentView('agenda')}
                    className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Calendar className="text-green-600" size={24} />
                    <span className="font-medium text-green-600 text-sm sm:text-base">Agendar Sessão</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentView('clients')}
                    className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Users className="text-purple-600" size={24} />
                    <span className="font-medium text-purple-600 text-sm sm:text-base">Ver Clientes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Clientes - SEM DATA DE CRIAÇÃO, COM IDADE CALCULADA */}
          {currentView === 'clients' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Clientes</h2>
                <button
                  onClick={() => {
                    if (!canAddClient()) {
                      alert(`Você atingiu o limite de ${plans[user.currentPlan].features.maxClients} clientes do seu plano. Faça upgrade para adicionar mais clientes!`)
                      return
                    }
                    setShowNewClientForm(true)
                  }}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={20} />
                  Criar Pasta
                </button>
              </div>

              {/* Barra de Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Lista de Clientes - SEM DATA DE CRIAÇÃO, COM IDADE CALCULADA */}
              {filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredClients.map(client => {
                    const clientAge = calculateAge(client.birthDate)
                    return (
                      <div key={client.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-base sm:text-lg">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{client.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{clientAge} anos</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Phone size={14} />
                            <span className="truncate">{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Mail size={14} />
                            <span className="truncate">{client.email}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewClientDetails(client)}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                          >
                            <Eye size={16} />
                            Ver Detalhes
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm border text-center">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 text-base sm:text-lg mb-2">Nenhum cliente cadastrado ainda</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Clique em "Criar Pasta" para adicionar seu primeiro cliente</p>
                </div>
              )}
            </div>
          )}

          {/* Agenda - SEM DATA NA LISTA DE SESSÕES */}
          {currentView === 'agenda' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Agenda</h2>
                <button
                  onClick={() => {
                    if (!canUseFeature('scheduling')) {
                      alert('Agendamento de sessões não está disponível no seu plano!')
                      return
                    }
                    setShowNewSessionForm(true)
                  }}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={20} />
                  Agendar Sessão
                </button>
              </div>

              {/* Navegação do Calendário */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <h3 className="text-base sm:text-xl font-semibold text-gray-800">
                    {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h3>
                  
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Calendário Real */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="p-2 text-center font-medium text-gray-600 text-xs sm:text-sm">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {generateCalendar(currentDate).map((date, i) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                    const isToday = date.toDateString() === new Date().toDateString()
                    const dateStr = date.toISOString().split('T')[0]
                    const daySession = sessions.find(s => s.date === dateStr)
                    
                    return (
                      <div
                        key={i}
                        className={`p-1 sm:p-2 text-center rounded-lg min-h-[40px] sm:min-h-[60px] border text-xs sm:text-sm ${
                          isToday ? 'bg-blue-100 border-blue-300 text-blue-800' :
                          isCurrentMonth ? 'text-gray-800 border-gray-200' : 'text-gray-400 border-gray-100'
                        } ${daySession ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`font-medium ${isToday ? 'font-bold' : ''}`}>
                          {date.getDate()}
                        </div>
                        {daySession && (
                          <div className="text-[10px] sm:text-xs mt-1 bg-blue-600 text-white px-1 py-0.5 rounded truncate">
                            {daySession.clientName}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Lista de Sessões - SEM DATA, APENAS HORÁRIO, TIPO E STATUS */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Próximas Sessões</h3>
                {sessions.filter(s => s.status === 'agendada' || s.status === 'confirmada').length > 0 ? (
                  <div className="space-y-3">
                    {sessions.filter(s => s.status === 'agendada' || s.status === 'confirmada').map(session => (
                      <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {session.clientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm sm:text-base">{session.clientName}</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {session.time} - {session.type}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">Status: {session.status}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          {session.status === 'agendada' ? (
                            <button 
                              onClick={() => handleConfirmSession(session.id)}
                              className="flex-1 sm:flex-none bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-green-100"
                            >
                              Confirmar
                            </button>
                          ) : (
                            <span className="flex-1 sm:flex-none bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs sm:text-sm text-center">
                              Confirmado
                            </span>
                          )}
                          <button 
                            onClick={() => handleCancelSession(session.id)}
                            className="flex-1 sm:flex-none bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-red-100"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8 text-sm">Nenhuma sessão agendada.</p>
                )}
              </div>
            </div>
          )}

          {/* Assinatura - COMPLETA COM PLANOS */}
          {currentView === 'subscription' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Assinatura</h2>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Informações do Plano Atual */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Plano Atual</h3>
                    <Crown className="text-yellow-500" size={24} />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Plano</span>
                      <span className="font-medium text-gray-800 text-sm sm:text-base">{plans[user.currentPlan].name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm ${
                        user.planStatus === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.planStatus === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Preço</span>
                      <span className="font-medium text-gray-800 text-sm sm:text-base">
                        R$ {plans[user.currentPlan].price.toFixed(2)}/mês
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Próxima cobrança</span>
                      <span className="font-medium text-gray-800 text-sm sm:text-base">
                        {new Date(user.nextBilling).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Recursos do seu plano:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          {plans[user.currentPlan].features.support}
                        </li>
                        <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          {plans[user.currentPlan].features.maxClients === 'unlimited' 
                            ? 'Pastas de clientes ilimitadas' 
                            : `Até ${plans[user.currentPlan].features.maxClients} pastas de clientes`}
                        </li>
                        <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          Agendamentos de sessões
                        </li>
                        {plans[user.currentPlan].features.reminders && (
                          <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            Lembretes de sessões
                          </li>
                        )}
                        {plans[user.currentPlan].features.templates && (
                          <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            Modelos de fichas prontas
                          </li>
                        )}
                        {plans[user.currentPlan].features.evolution && (
                          <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            Gráfico de evolução do cliente
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button 
                      onClick={() => setShowUpgradePlan(true)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <ArrowUp size={20} />
                      Fazer Upgrade
                    </button>
                    <button 
                      onClick={() => setShowInvoiceHistory(true)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Ver Histórico
                    </button>
                    <button 
                      onClick={() => setShowCancelSubscription(true)}
                      className="bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configurações - COM BOTÕES DE SALVAR SEPARADOS, SEM FUSO HORÁRIO */}
          {currentView === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Configurações</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Perfil - SEM FUSO HORÁRIO */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex items-center gap-2 mb-4">
                    <UserCircle className="text-blue-600" size={24} />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Perfil</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                      <input
                        type="text"
                        value={tempUser.name}
                        onChange={(e) => setTempUser({...tempUser, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={tempUser.email}
                        onChange={(e) => setTempUser({...tempUser, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <button 
                      onClick={handleSaveProfileSettings}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>

                {/* Notificações - SEM "NOVOS CLIENTES" */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="text-blue-600" size={24} />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notificações</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm sm:text-base">Notificações por Email</span>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600" 
                        checked={tempNotifications.email}
                        onChange={(e) => setTempNotifications({...tempNotifications, email: e.target.checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm sm:text-base">Lembrete de Sessões</span>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600" 
                        checked={tempNotifications.sessoes}
                        onChange={(e) => setTempNotifications({...tempNotifications, sessoes: e.target.checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm sm:text-base">Relatórios Mensais</span>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600" 
                        checked={tempNotifications.relatorios}
                        onChange={(e) => setTempNotifications({...tempNotifications, relatorios: e.target.checked})}
                      />
                    </div>
                    
                    <button 
                      onClick={handleSaveNotificationSettings}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Novo Cliente */}
      {showNewClientForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Criar Nova Pasta</h3>
            
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone de Emergência</label>
                  <input
                    type="tel"
                    value={newClient.emergencyPhone}
                    onChange={(e) => setNewClient({...newClient, emergencyPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gênero</label>
                  <select
                    value={newClient.gender}
                    onChange={(e) => setNewClient({...newClient, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Não-binário">Não-binário</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    value={newClient.birthDate}
                    onChange={(e) => setNewClient({...newClient, birthDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Problema Principal</label>
                <textarea
                  value={newClient.mainProblem}
                  onChange={(e) => setNewClient({...newClient, mainProblem: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={3}
                  placeholder="Descreva brevemente o problema principal do cliente..."
                  required
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewClientForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Sessão */}
      {showNewSessionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Agendar Nova Sessão</h3>
            
            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <select
                  value={newSession.clientId}
                  onChange={(e) => setNewSession({...newSession, clientId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                <input
                  type="time"
                  value={newSession.time}
                  onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo da Reunião</label>
                <select
                  value={newSession.type}
                  onChange={(e) => setNewSession({...newSession, type: e.target.value as 'online' | 'presencial'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status da Sessão</label>
                <select
                  value={newSession.status}
                  onChange={(e) => setNewSession({...newSession, status: e.target.value as 'agendada' | 'confirmada' | 'cancelada' | 'faltou'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="agendada">Agendada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="faltou">Faltou</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewSessionForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico de Faturas */}
      {showInvoiceHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Histórico de Faturas</h3>
              <button
                onClick={() => setShowInvoiceHistory(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-500 text-center py-8 text-sm">Nenhuma fatura registrada ainda.</p>
          </div>
        </div>
      )}

      {/* Modal Cancelar Assinatura */}
      {showCancelSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Cancelar Assinatura</h3>
              <button
                onClick={() => setShowCancelSubscription(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCancelSubscription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Por qual motivo você deseja cancelar sua assinatura?
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={4}
                  placeholder="Descreva o motivo do cancelamento..."
                  required
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCancelSubscription(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upgrade de Plano */}
      {showUpgradePlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Escolha seu Plano</h3>
              <button
                onClick={() => setShowUpgradePlan(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Plano Start */}
              <div className={`border-2 rounded-xl p-4 sm:p-6 ${
                user.currentPlan === 'start' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}>
                <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Plano Start</h4>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-4">
                  R$ 47<span className="text-base sm:text-lg text-gray-600">/mês</span>
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                    Suporte horário comercial (10h-18h)
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                    15 pastas de clientes
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                    Agendamentos de sessões
                  </li>
                </ul>
                {user.currentPlan === 'start' ? (
                  <button disabled className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-lg cursor-not-allowed text-sm">
                    Plano Atual
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgradePlan('start')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Selecionar
                  </button>
                )}
              </div>

              {/* Plano Pro */}
              <div className={`border-2 rounded-xl p-4 sm:p-6 ${
                user.currentPlan === 'pro' 
                  ? 'border-purple-600 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800">Plano Pro</h4>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Popular</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mb-4">
                  R$ 97<span className="text-base sm:text-lg text-gray-600">/mês</span>
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5"></div>
                    Suporte 24 horas
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5"></div>
                    65 pastas de clientes
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5"></div>
                    Agendamentos e lembretes
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5"></div>
                    Modelos de fichas prontas
                  </li>
                </ul>
                {user.currentPlan === 'pro' ? (
                  <button disabled className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-lg cursor-not-allowed text-sm">
                    Plano Atual
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgradePlan('pro')}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Selecionar
                  </button>
                )}
              </div>

              {/* Plano Infinity */}
              <div className={`border-2 rounded-xl p-4 sm:p-6 ${
                user.currentPlan === 'infinity' 
                  ? 'border-yellow-600 bg-yellow-50' 
                  : 'border-gray-200 hover:border-yellow-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800">Plano Infinity</h4>
                  <Crown className="text-yellow-500" size={20} />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-4">
                  R$ 197<span className="text-base sm:text-lg text-gray-600">/mês</span>
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5"></div>
                    Suporte 24h com prioridade
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5"></div>
                    Pastas de clientes ILIMITADAS
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5"></div>
                    Agendamentos e lembretes
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5"></div>
                    Modelos de fichas prontas
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-1.5"></div>
                    Gráfico de evolução do cliente
                  </li>
                </ul>
                {user.currentPlan === 'infinity' ? (
                  <button disabled className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-lg cursor-not-allowed text-sm">
                    Plano Atual
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgradePlan('infinity')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors text-sm"
                  >
                    Selecionar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
