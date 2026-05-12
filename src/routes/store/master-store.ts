// src/store/master-store.ts

import { create } from 'zustand'

/* ================= TYPES ================= */

export type Company = {
  id: number
  name: string
  legalName: string
  address: string
  email: string
  phone: string
  website: string
  logo: string
}

export type Employee = {
  id: number
  name: string
  email: string
  phone: string
  position: string
  status: string
  companyId: number
}

export type BankAccount = {
  id: number
  bank: string
  accountName: string
  accountNumber: string
  companyId: number
}

/* ================= STORE ================= */

type MasterStore = {
  companies: Company[]
  employees: Employee[]
  bankAccounts: BankAccount[]

  setCompanies: (data: Company[]) => void

  setEmployees: (data: Employee[]) => void

  setBankAccounts: (data: BankAccount[]) => void
}

export const useMasterStore = create<MasterStore>((set) => ({
  /* ================= COMPANY ================= */

  companies: [
    {
      id: 1,
      name: 'Zerra',
      legalName: 'PT Zerra Teknologi Integrasi',
      address: 'Jl. Joyogrand Blok EE No.14',
      email: 'zerrateknologiintegrasi@gmail.com',
      phone: '08123456789',
      website: 'myzerra.id',
      logo: '/logo-zerra.png',
    },
  ],

  /* ================= EMPLOYEE ================= */

  employees: [
    {
      id: 1,
      name: 'Kharisma Artika',
      email: 'kharisma@gmail.com',
      phone: '08123456789',
      position: 'Frontend Developer',
      status: 'Active',
      companyId: 1,
    },
  ],

  /* ================= BANK ================= */

  bankAccounts: [
    {
      id: 1,
      bank: 'BCA',
      accountName: 'PT Zerra Teknologi Integrasi',
      accountNumber: '123456789',
      companyId: 1,
    },
  ],

  /* ================= ACTION ================= */

  setCompanies: (data) =>
    set({
      companies: data,
    }),

  setEmployees: (data) =>
    set({
      employees: data,
    }),

  setBankAccounts: (data) =>
    set({
      bankAccounts: data,
    }),
}))
