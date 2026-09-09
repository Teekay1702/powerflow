export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  branchId: string | null;
  companyId: string | null;
  avatarUrl?: string;
  phone?: string;
  position?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreatePasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterEmployeeData {
  email: string;
  name: string;
  surname: string;
  phone?: string;
  branchId?: string;
  position?: string;
  role: 'MANAGER' | 'EMPLOYEE';
}

export interface Customer {
  id: string;
  customerNumber: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  propertyType: string;
  gpsCoordinates?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
  isPrimary: boolean;
}

export interface ProductBase {
  id: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  imageUrl?: string;
  description?: string;
}

export interface SolarPanel extends ProductBase {
  brand: string;
  model: string;
  wattage: number;
  voltage: number;
  efficiency: number;
  warrantyYears: number;
}

export interface Battery extends ProductBase {
  brand: string;
  model: string;
  capacityAh: number;
  voltage: number;
  chemistry: string;
  cycles?: number;
  usableCapacity?: number;
}

export interface Inverter extends ProductBase {
  brand: string;
  model: string;
  capacityVa: number;
  voltage: number;
  inverterType: string;
  maxPvInput?: number;
}

export interface Accessory extends ProductBase {
  name: string;
  category: string;
  specifications?: string;
  unit: string;
}

export interface ApplianceInput {
  applianceId?: string;
  applianceName: string;
  quantity: number;
  powerRating: number;
  startingSurge?: number;
  dailyHours: number;
  peakHours?: number;
  isEssential: boolean;
}

export interface ApplianceCatalogueItem {
  id: string;
  category: string;
  make: string;
  model: string;
  wattage: number;
  startingSurgeMultiplier?: number;
  defaultHoursPerDay?: number;
  notes?: string;
}

export interface ElectricalLoad {
  id: string;
  name: string;
  customerId: string;
  propertyType: string;
  totalConnectedLoad: number;
  peakLoad: number;
  averageLoad: number;
  dailyConsumption: number;
  monthlyConsumption: number;
  annualConsumption: number;
  surgeRequirements: number;
  demandFactor: number;
  coincidenceFactor: number;
  loadDiversity: number;
  continuousLoad: number;
  criticalLoad: number;
  status: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer?: Customer;
  createdById: string;
  status: string;
  subtotal: number;
  labourCost: number;
  installationCost: number;
  discountAmount: number;
  vatAmount: number;
  grandTotal: number;
  validityDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  itemType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata?: Record<string, unknown>;
}

export interface DashboardStats {
  totalQuotations: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  quotationSuccessRate: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface RecommendedProduct {
  productId: string;
  itemType: 'PANEL' | 'BATTERY' | 'INVERTER' | 'ACCESSORY' | 'LABOUR' | 'INSTALLATION';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  unit?: string;
  specs?: Record<string, unknown>;
}

export interface SystemRecommendation {
  load: {
    id: string;
    name: string;
    propertyType: string;
    totalConnectedLoad: number;
    peakLoad: number;
    dailyConsumption: number;
    surgeRequirements: number;
  };
  sizing: {
    battery: {
      requiredCapacityKwh: number;
      numberOfBatteries: number;
      requiredBankVoltage: number;
    };
    solar: {
      totalRequiredCapacityKw: number;
      numberOfPanels: number;
      roofAreaNeeded: number;
      dailyProduction: number;
    };
    inverter: {
      totalInverterCapacity: number;
      hybridRecommended: boolean;
      multipleInvertersNeeded: boolean;
    };
  };
  products: {
    panels: RecommendedProduct[];
    batteries: RecommendedProduct[];
    inverters: RecommendedProduct[];
    accessories: RecommendedProduct[];
  };
  totalEquipmentCost: number;
  notes: string[];
}