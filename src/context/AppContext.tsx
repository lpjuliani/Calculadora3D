import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

interface Printer { id: string; marca: string; modelo: string; potencia: number; vidaUtil: number; valorPago: number; percentualFalhas: number; }
interface Filament { id: string; marca: string; tipo: string; cor: string; custoRolo: number; pesoRolo: number; estoqueAtual: number; }
interface Accessory { id: string; tipo: string; quantidadeTotal: number; precoTotal: number; precoUnitario: number; estoqueAtual: number; }
interface Packaging { id: string; tipo: string; quantidadeTotal: number; precoTotal: number; precoUnitario: number; estoqueAtual: number; }
interface Category { id: string; nome: string; }
interface CompanySettings {
  nomeFantasia: string; razaoSocial: string; cnpj: string; endereco: string; telefone: string;
  email: string; site: string; logo: string; pixChave: string; dadosBancarios: string;
  qrCodePix: string; prazoEntrega: string; validadeOrcamento: string; observacoes: string;
}
interface PrintRecord {
  id: string; data: string; cliente: string; produto: string; categoria: string; impressora: string;
  pesoTotal: number; tempoTotal: number; quantidade: number; custoTotal: number;
  precoUnitario: number; lucroUnitario: number; lucroTotal: number;
}
interface AppState {
  printers: Printer[]; filaments: Filament[]; accessories: Accessory[];
  packaging: Packaging[]; categories: Category[]; printHistory: PrintRecord[];
  companySettings: CompanySettings;
}
type AppAction =
  | { type: "ADD_PRINTER"; payload: Printer }
  | { type: "UPDATE_PRINTER"; payload: Printer }
  | { type: "DELETE_PRINTER"; payload: string }
  | { type: "ADD_FILAMENT"; payload: Filament }
  | { type: "UPDATE_FILAMENT"; payload: Filament }
  | { type: "DELETE_FILAMENT"; payload: string }
  | { type: "ADD_ACCESSORY"; payload: Accessory }
  | { type: "UPDATE_ACCESSORY"; payload: Accessory }
  | { type: "DELETE_ACCESSORY"; payload: string }
  | { type: "ADD_PACKAGING"; payload: Packaging }
  | { type: "UPDATE_PACKAGING"; payload: Packaging }
  | { type: "DELETE_PACKAGING"; payload: string }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "ADD_PRINT_RECORD"; payload: PrintRecord }
  | { type: "UPDATE_STOCK"; payload: { filaments: Array<{id: string, amount: number}>, accessories: Array<{id: string, amount: number}>, packaging: Array<{id: string, amount: number}> } }
  | { type: "LOAD_DATA"; payload: AppState }
  | { type: "UPDATE_COMPANY_SETTINGS"; payload: CompanySettings }
  | { type: "RESET_DATA" };

const initialState: AppState = {
  printers: [], filaments: [], accessories: [], packaging: [], categories: [], printHistory: [],
  companySettings: {
    nomeFantasia: "", razaoSocial: "", cnpj: "", endereco: "", telefone: "", email: "",
    site: "", logo: "", pixChave: "", dadosBancarios: "", qrCodePix: "",
    prazoEntrega: "7 dias úteis", validadeOrcamento: "30 dias", observacoes: ""
  }
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_PRINTER": return { ...state, printers: [...state.printers, action.payload] };
    case "UPDATE_PRINTER": return { ...state, printers: state.printers.map(p => p.id === action.payload.id ? action.payload : p) };
    case "DELETE_PRINTER": return { ...state, printers: state.printers.filter(p => p.id !== action.payload) };
    case "ADD_FILAMENT": return { ...state, filaments: [...state.filaments, action.payload] };
    case "UPDATE_FILAMENT": return { ...state, filaments: state.filaments.map(f => f.id === action.payload.id ? action.payload : f) };
    case "DELETE_FILAMENT": return { ...state, filaments: state.filaments.filter(f => f.id !== action.payload) };
    case "ADD_ACCESSORY": return { ...state, accessories: [...state.accessories, { ...action.payload, estoqueAtual: action.payload.quantidadeTotal }] };
    case "UPDATE_ACCESSORY": return { ...state, accessories: state.accessories.map(a => a.id === action.payload.id ? action.payload : a) };
    case "DELETE_ACCESSORY": return { ...state, accessories: state.accessories.filter(a => a.id !== action.payload) };
    case "ADD_PACKAGING": return { ...state, packaging: [...state.packaging, { ...action.payload, estoqueAtual: action.payload.quantidadeTotal }] };
    case "UPDATE_PACKAGING": return { ...state, packaging: state.packaging.map(p => p.id === action.payload.id ? action.payload : p) };
    case "DELETE_PACKAGING": return { ...state, packaging: state.packaging.filter(p => p.id !== action.payload) };
    case "ADD_CATEGORY": return { ...state, categories: [...state.categories, action.payload] };
    case "UPDATE_CATEGORY": return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) };
    case "DELETE_CATEGORY": return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    case "ADD_PRINT_RECORD": return { ...state, printHistory: [...state.printHistory, action.payload] };
    case "UPDATE_STOCK":
      return {
        ...state,
        filaments: state.filaments.map(f => {
          const u = action.payload.filaments.find(x => x.id === f.id);
          return u ? { ...f, estoqueAtual: f.estoqueAtual - u.amount } : f;
        }),
        accessories: state.accessories.map(a => {
          const u = action.payload.accessories.find(x => x.id === a.id);
          return u ? { ...a, estoqueAtual: a.estoqueAtual - u.amount } : a;
        }),
        packaging: state.packaging.map(p => {
          const u = action.payload.packaging.find(x => x.id === p.id);
          return u ? { ...p, estoqueAtual: p.estoqueAtual - u.amount } : p;
        })
      };
    case "LOAD_DATA": return { ...action.payload };
    case "UPDATE_COMPANY_SETTINGS": return { ...state, companySettings: action.payload };
    case "RESET_DATA": return { ...initialState };
    default: return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction>; } | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: auth } = useAuth();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const skipNextSaveRef = useRef(false);

  // --- CHAVE ÚNICA POR USUÁRIO (username minúsculo) ---
  const userKey = auth.currentUser?.username?.toLowerCase() || "";
  const storageKey = userKey ? `3dp:data:${userKey}` : "";

  const loadUserData = (): AppState | null => {
    if (!storageKey) return null;
    try {
      console.log('🔍 Tentando carregar dados para chave:', storageKey);
      const raw = localStorage.getItem(storageKey);
      console.log('📦 Dados brutos do localStorage:', raw ? 'ENCONTRADOS' : 'VAZIOS');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { console.error("loadUserData", e); return null; }
  };

  const saveUserData = (data: AppState) => {
    if (!storageKey) return;
    console.log('💾 Salvando dados para chave:', storageKey);
    console.log('📊 Dados sendo salvos:', {
      printers: data.printers.length,
      filaments: data.filaments.length,
      accessories: data.accessories.length,
      packaging: data.packaging.length,
      categories: data.categories.length,
      printHistory: data.printHistory.length
    });
    try { localStorage.setItem(storageKey, JSON.stringify(data)); }
    catch (e) { console.error("saveUserData", e); }
  };

  // LOGIN/LOGOUT -> carregar sem sobrescrever
  useEffect(() => {
    console.log('🔄 useEffect LOGIN/LOGOUT disparado:', { 
      isAuthenticated: auth.isAuthenticated, 
      userKey,
      hasStorageKey: !!storageKey 
    });
    if (auth.isAuthenticated && userKey) {
      const data = loadUserData() ?? initialState;
      console.log('📂 Dados carregados:', {
        printers: data.printers.length,
        filaments: data.filaments.length,
        accessories: data.accessories.length,
        packaging: data.packaging.length,
        categories: data.categories.length,
        printHistory: data.printHistory.length
      });
      skipNextSaveRef.current = true; // não salvar logo após carregar
      dispatch({ type: "LOAD_DATA", payload: data });
      setHydrated(true);
    } else {
      console.log('🚫 Usuário não autenticado - resetando dados');
      skipNextSaveRef.current = true;
      dispatch({ type: "RESET_DATA" });
      setHydrated(false);
    }
  }, [auth.isAuthenticated, userKey]);

  // SALVAR (somente após hidratar e logado)
  useEffect(() => {
    console.log('💾 useEffect SALVAR disparado:', {
      isAuthenticated: auth.isAuthenticated,
      userKey,
      hydrated,
      skipNext: skipNextSaveRef.current
    });
    if (!auth.isAuthenticated || !userKey || !hydrated) return;
    if (skipNextSaveRef.current) { skipNextSaveRef.current = false; return; }
    console.log('✅ Condições atendidas - salvando dados');
    saveUserData(state);
  }, [state, auth.isAuthenticated, userKey, hydrated]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export type { Printer, Filament, Accessory, Packaging, Category, PrintRecord, CompanySettings, AppState };