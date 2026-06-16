export type InventoryItem = {
  id_inventory: string;
  produk: string;
  jumlah: number;
  harga: number;
};

export type DeliveryType = "ambil_kampus_b" | "ambil_kampus_c" | "delivery";

export type PaymentProofFile = {
  fileName: string;
  mimeType: string;
  base64: string;
};

export type OrderPayload = {
  nama: string;
  no_telp: string;
  tipe_delivery: DeliveryType;
  alamat_delivery: string;
  referral_code: string;
  bukti_bayar_file: PaymentProofFile;
  cart: {
    id_inventory: string;
    qty: number;
  }[];
};