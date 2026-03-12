export interface CustomerProfile {
  name: string;
  email: string;
  phone: string | null;
  address: Record<string, string> | null;
}

export const emptyProfile: CustomerProfile = {
  name: "",
  email: "",
  phone: null,
  address: null,
};
