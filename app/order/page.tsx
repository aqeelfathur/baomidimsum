"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type InventoryItem = {
  id_inventory: string;
  produk: string;
  jumlah: number;
  harga: number;
};

type DeliveryType = "ambil_kampus_b" | "ambil_kampus_c" | "delivery";

type Quantities = Record<string, number>;

type ReferralResult = {
  success: boolean;
  valid: boolean;
  diskon_produk: number;
  diskon_ongkir: number;
  message: string;
};

const DELIVERY_FEE = 5000;
const MAX_PAYMENT_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "DIMSUM 6 PCS": "/dimsum6pcs.webp",
  "ADDITIONAL CHILI OIL": "/chilioil.webp",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.split(",")[1];

      if (!base64) {
        reject(new Error("File tidak valid."));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error("Gagal membaca file."));
    };

    reader.readAsDataURL(file);
  });
}

export default function OrderPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [quantities, setQuantities] = useState<Quantities>({});

  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventoryError, setInventoryError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validatingReferral, setValidatingReferral] = useState(false);

  const [nama, setNama] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [tipeDelivery, setTipeDelivery] =
    useState<DeliveryType>("ambil_kampus_b");
  const [alamatDelivery, setAlamatDelivery] = useState("");

  const [referralCode, setReferralCode] = useState("");
  const [referralChecked, setReferralChecked] = useState(false);
  const [referralValid, setReferralValid] = useState(false);
  const [referralMessage, setReferralMessage] = useState("");
  const [diskonProduk, setDiskonProduk] = useState(0);
  const [diskonOngkir, setDiskonOngkir] = useState(0);

  const [buktiBayarFile, setBuktiBayarFile] = useState<File | null>(null);

  const subtotalProduk = useMemo(() => {
    return inventory.reduce((total, item) => {
      const qty = quantities[item.id_inventory] || 0;
      return total + item.harga * qty;
    }, 0);
  }, [inventory, quantities]);

  const ongkir = useMemo(() => {
    return tipeDelivery === "delivery" ? DELIVERY_FEE : 0;
  }, [tipeDelivery]);

  const potonganProduk = useMemo(() => {
    if (!referralValid) return 0;
    return Math.round((subtotalProduk * diskonProduk) / 100);
  }, [subtotalProduk, referralValid, diskonProduk]);

  const potonganOngkir = useMemo(() => {
    if (!referralValid) return 0;
    return Math.round((ongkir * diskonOngkir) / 100);
  }, [ongkir, referralValid, diskonOngkir]);

  const totalBayar = subtotalProduk + ongkir - potonganProduk - potonganOngkir;

  const totalItems = useMemo(() => {
    return Object.values(quantities).reduce((total, qty) => total + qty, 0);
  }, [quantities]);

  const selectedItems = useMemo(() => {
    return inventory
      .filter((item) => (quantities[item.id_inventory] || 0) > 0)
      .map((item) => {
        const qty = quantities[item.id_inventory] || 0;

        return {
          ...item,
          qty,
          subtotal: item.harga * qty,
        };
      });
  }, [inventory, quantities]);

  useEffect(() => {
    fetchInventory();
  }, []);

  function resetReferralState() {
    setReferralChecked(false);
    setReferralValid(false);
    setReferralMessage("");
    setDiskonProduk(0);
    setDiskonOngkir(0);
  }

  async function fetchInventory() {
    try {
      setLoadingInventory(true);
      setInventoryError("");

      const response = await fetch("/api/inventory", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!result.success) {
        setInventoryError(result.message || "Gagal mengambil inventory.");
        return;
      }

      const items: InventoryItem[] = Array.isArray(result.data)
        ? result.data
        : [];

      setInventory(items);

      setQuantities((prev) => {
        const next: Quantities = {};

        items.forEach((item) => {
          next[item.id_inventory] = prev[item.id_inventory] || 0;
        });

        return next;
      });
    } catch {
      setInventoryError("Gagal mengambil inventory.");
    } finally {
      setLoadingInventory(false);
    }
  }

  function updateQuantity(item: InventoryItem, type: "plus" | "minus") {
    setQuantities((prev) => {
      const currentQty = prev[item.id_inventory] || 0;

      if (type === "plus") {
        if (currentQty >= item.jumlah) {
          alert(`Stok ${item.produk} hanya tersisa ${item.jumlah}.`);
          return prev;
        }

        return {
          ...prev,
          [item.id_inventory]: currentQty + 1,
        };
      }

      return {
        ...prev,
        [item.id_inventory]: Math.max(currentQty - 1, 0),
      };
    });
  }

  async function validateReferral(
    options: { silent?: boolean } = {}
  ): Promise<ReferralResult | null> {
    const code = referralCode.trim().toUpperCase();

    if (!code) {
      resetReferralState();
      return {
        success: true,
        valid: false,
        diskon_produk: 0,
        diskon_ongkir: 0,
        message: "Referral code kosong.",
      };
    }

    try {
      setValidatingReferral(true);

      const response = await fetch("/api/referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });

      const result = await response.json();

      const normalizedResult: ReferralResult = {
        success: Boolean(result.success),
        valid: Boolean(result.valid),
        diskon_produk: Number(result.diskon_produk) || 0,
        diskon_ongkir: Number(result.diskon_ongkir) || 0,
        message: result.message || "",
      };

      setReferralChecked(true);
      setReferralValid(normalizedResult.valid);
      setReferralMessage(normalizedResult.message);
      setDiskonProduk(normalizedResult.diskon_produk);
      setDiskonOngkir(normalizedResult.diskon_ongkir);

      if (!normalizedResult.valid && !options.silent) {
        alert(normalizedResult.message || "Referral code tidak valid.");
      }

      return normalizedResult;
    } catch {
      setReferralChecked(true);
      setReferralValid(false);
      setReferralMessage("Gagal validasi referral.");
      setDiskonProduk(0);
      setDiskonOngkir(0);

      if (!options.silent) {
        alert("Gagal validasi referral.");
      }

      return null;
    } finally {
      setValidatingReferral(false);
    }
  }

  function handlePaymentFileChange(file: File | null) {
    if (!file) {
      setBuktiBayarFile(null);
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Format bukti bayar harus PNG, JPG, WEBP, atau PDF.");
      setBuktiBayarFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    if (file.size > MAX_PAYMENT_FILE_SIZE) {
      alert("Ukuran bukti bayar maksimal 5MB.");
      setBuktiBayarFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setBuktiBayarFile(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting) return;

    if (!nama.trim()) {
      alert("Nama wajib diisi.");
      return;
    }

    if (!noTelp.trim()) {
      alert("No telp / WhatsApp wajib diisi.");
      return;
    }

    if (tipeDelivery === "delivery" && !alamatDelivery.trim()) {
      alert("Alamat delivery wajib diisi.");
      return;
    }

    if (totalItems === 0) {
      alert("Pilih minimal 1 produk dulu ya.");
      return;
    }

    if (!buktiBayarFile) {
      alert("Upload bukti bayar dulu ya.");
      return;
    }

    if (referralCode.trim() && !referralChecked) {
      const result = await validateReferral({ silent: true });

      if (!result?.valid) {
        alert(
          result?.message ||
            "Referral code tidak valid. Hapus kode referral atau gunakan kode lain."
        );
        return;
      }
    }

    const cart = selectedItems.map((item) => ({
      id_inventory: item.id_inventory,
      qty: item.qty,
    }));

    try {
      setSubmitting(true);

      const buktiBayarBase64 = await fileToBase64(buktiBayarFile);

      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: nama.trim(),
          no_telp: noTelp.trim(),
          tipe_delivery: tipeDelivery,
          alamat_delivery:
            tipeDelivery === "delivery" ? alamatDelivery.trim() : "-",
          referral_code: referralCode.trim().toUpperCase(),
          bukti_bayar_file: {
            fileName: buktiBayarFile.name,
            mimeType: buktiBayarFile.type,
            base64: buktiBayarBase64,
          },
          cart,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.message || "Order gagal dibuat.");
        await fetchInventory();
        return;
      }

      alert(
        `Order berhasil dibuat!\n\nID Order: ${
          result.order_id
        }\nTotal Bayar: ${formatRupiah(result.total_bayar)}`
      );

      setNama("");
      setNoTelp("");
      setTipeDelivery("ambil_kampus_b");
      setAlamatDelivery("");
      setReferralCode("");
      resetReferralState();
      setBuktiBayarFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchInventory();
    } catch {
      alert("Order gagal dibuat.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F4EE] px-5 py-8 text-[#2A1810] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center rounded-2xl border border-[#E8CDBB] bg-white px-4 py-2.5 text-sm font-bold text-[#C61B16] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#C61B16]/40 transform focus:outline-none focus:ring-2 focus:ring-[#C61B16]/20">
          ← 
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] bg-white p-5 shadow-xl shadow-[#E7B98A]/30 md:p-7"
          >
            <div>
              <div className="mb-2">
                <Image
                  src="/baomilogo.webp"
                  alt="Baomi Dimsum"
                  width={150}
                  height={48}
                  priority
                  className="w-[130px] md:w-[150px]"
                  style={{ height: "auto" }}
                />
              </div>
              <p className="mt-2 text-sm leading-6 text-[#7A5A49]">
                Pilih produk sesuai stok tersedia, upload bukti bayar, lalu
                submit order.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">Nama</label>
                <input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full rounded-2xl border border-[#E8CDBB] px-4 py-3 outline-none transition focus:border-[#C61B16]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  No Telp / WhatsApp
                </label>
                <input
                  value={noTelp}
                  onChange={(e) => setNoTelp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-2xl border border-[#E8CDBB] px-4 py-3 outline-none transition focus:border-[#C61B16]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Opsi Pengiriman
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setTipeDelivery("ambil_kampus_b")}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      tipeDelivery === "ambil_kampus_b"
                        ? "border-[#C61B16] bg-[#FFF0E7]"
                        : "border-[#E8CDBB] bg-white"
                    }`}
                  >
                    <p className="font-bold">Ambil Kampus B</p>
                    <p className="mt-1 text-xs text-[#7A5A49]">
                      Gratis ongkir
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipeDelivery("ambil_kampus_c")}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      tipeDelivery === "ambil_kampus_c"
                        ? "border-[#C61B16] bg-[#FFF0E7]"
                        : "border-[#E8CDBB] bg-white"
                    }`}
                  >
                    <p className="font-bold">Ambil Kampus C</p>
                    <p className="mt-1 text-xs text-[#7A5A49]">
                      Gratis ongkir
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipeDelivery("delivery")}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      tipeDelivery === "delivery"
                        ? "border-[#C61B16] bg-[#FFF0E7]"
                        : "border-[#E8CDBB] bg-white"
                    }`}
                  >
                    <p className="font-bold">Delivery</p>
                    <p className="mt-1 text-xs text-[#7A5A49]">
                      +{formatRupiah(DELIVERY_FEE)}
                    </p>
                  </button>
                </div>
              </div>

              {tipeDelivery === "delivery" ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Alamat Delivery
                  </label>
                  <textarea
                    value={alamatDelivery}
                    onChange={(e) => setAlamatDelivery(e.target.value)}
                    placeholder="Isi alamat lengkap"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-[#E8CDBB] px-4 py-3 outline-none transition focus:border-[#C61B16]"
                  />
                </div>
              ) : null}

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="block text-sm font-semibold">
                    Pilih Produk
                  </label>

                  <button
                    type="button"
                    onClick={fetchInventory}
                    disabled={loadingInventory}
                    className="text-xs font-bold text-[#C61B16] disabled:opacity-50"
                  >
                    Refresh Stok
                  </button>
                </div>

                {loadingInventory ? (
                  <div className="rounded-2xl border border-[#E8CDBB] p-4 text-sm text-[#7A5A49]">
                    Mengambil inventory...
                  </div>
                ) : inventoryError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-700">
                      {inventoryError}
                    </p>
                    <button
                      type="button"
                      onClick={fetchInventory}
                      className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : inventory.length === 0 ? (
                  <div className="rounded-2xl border border-[#E8CDBB] p-4 text-sm text-[#7A5A49]">
                    Belum ada produk tersedia.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inventory.map((item) => {
                      const qty = quantities[item.id_inventory] || 0;
                      const soldOut = item.jumlah <= 0;
                      const imageSrc =
                        PRODUCT_IMAGE_MAP[item.produk] || "/dimsum6pcs.webp";

                      return (
                        <div
                          key={item.id_inventory}
                          className="flex flex-col gap-4 rounded-2xl border border-[#E8CDBB] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <Image
                              src={imageSrc}
                              alt={item.produk}
                              width={96}
                              height={96}
                              className="h-24 w-24 rounded-2xl object-cover"
                            />

                            <div>
                              <h3 className="font-bold">{item.produk}</h3>
                              <p className="mt-1 text-sm font-bold text-[#C61B16]">
                                {formatRupiah(item.harga)}
                              </p>
                              <p className="mt-1 text-xs text-[#7A5A49]">
                                {soldOut
                                  ? "Sold out"
                                  : `Stok tersedia: ${item.jumlah}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item, "minus")}
                              disabled={qty === 0}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E7] text-lg font-bold text-[#C61B16] disabled:opacity-40"
                            >
                              -
                            </button>

                            <span className="w-8 text-center font-bold">
                              {qty}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(item, "plus")}
                              disabled={soldOut}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C61B16] text-lg font-bold text-white disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Referral Code
                </label>

                <div className="flex gap-2">
                  <input
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value.toUpperCase());
                      resetReferralState();
                    }}
                    className="w-full rounded-2xl border border-[#E8CDBB] px-4 py-3 outline-none transition focus:border-[#C61B16]"
                  />

                  <button
                    type="button"
                    onClick={() => validateReferral()}
                    disabled={validatingReferral || !referralCode.trim()}
                    className="rounded-2xl bg-[#2A1810] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {validatingReferral ? "Cek..." : "Cek"}
                  </button>
                </div>

                {referralMessage ? (
                  <div
                    className={`mt-2 rounded-2xl px-4 py-3 text-sm ${
                      referralValid
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <p className="font-semibold">{referralMessage}</p>

                    {referralValid ? (
                      <p className="mt-1 text-xs">
                        Diskon produk {diskonProduk}% · Diskon ongkir{" "}
                        {diskonOngkir}%
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

            </div>

            <button
              type="submit"
              disabled={submitting || loadingInventory}
              className="mt-6 w-full rounded-2xl bg-[#C61B16] px-5 py-4 font-extrabold text-white transition hover:bg-[#A01512] disabled:opacity-60"
            >
              {submitting ? "Memproses Order..." : "Submit Order"}
            </button>
          </form>

          <aside className="h-fit rounded-[2rem] bg-white p-5 shadow-xl shadow-[#E7B98A]/30 md:p-7">
            <div className="space-y-5">
              <aside className="h-fit rounded-[2rem] bg-white p-5 shadow-xl shadow-[#E7B98A]/30 md:p-7">
                <p className="mb-2 text-sm font-semibold text-[#C61B16]">
                  RINGKASAN
                </p>
                <h2 className="text-2xl font-extrabold">Order Kamu</h2>

                <div className="mt-5 space-y-3">
                  {selectedItems.length > 0 ? (
                    selectedItems.map((item) => (
                      <div
                        key={item.id_inventory}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <div>
                          <p className="font-semibold">{item.produk}</p>
                          <p className="mt-1 text-xs text-[#7A5A49]">
                            {item.qty} x {formatRupiah(item.harga)}
                          </p>
                        </div>

                        <span className="font-bold">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#7A5A49]">
                      Belum ada produk dipilih.
                    </p>
                  )}
                </div>

                <div className="mt-5 border-t border-[#E8CDBB] pt-5">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal Produk</span>
                    <span className="font-bold">
                      {formatRupiah(subtotalProduk)}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span>Ongkir</span>
                    <span className="font-bold">{formatRupiah(ongkir)}</span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span>Diskon Produk</span>
                    <span className="font-bold text-green-700">
                      -{formatRupiah(potonganProduk)}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span>Diskon Ongkir</span>
                    <span className="font-bold text-green-700">
                      -{formatRupiah(potonganOngkir)}
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#FFF0E7] p-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-extrabold">Total Bayar</span>
                      <span className="font-extrabold text-[#C61B16]">
                        {formatRupiah(totalBayar)}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              <section className="h-fit rounded-[2rem] bg-white p-5 shadow-xl shadow-[#E7B98A]/30 md:p-7">
                <p className="mb-2 text-sm font-semibold text-[#C61B16]">
                  PEMBAYARAN
                </p>
                <h2 className="text-2xl font-extrabold">Scan QRIS</h2>

                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#E8CDBB] bg-[#FFFBF7] p-4">
                  <Image
                    src="/qris.jpg"
                    alt="QRIS Baomi Dimsum"
                    width={640}
                    height={640}
                    className="w-full rounded-[1rem]"
                    style={{ height: "auto" }}
                  />
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold">
                    Upload Bukti Bayar
                  </label>

                  <div className="mb-3 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl border-2 border-[#C61B16] bg-white px-6 py-3 font-bold text-[#C61B16] transition hover:bg-[#FFF0E7]"
                    >
                      {buktiBayarFile ? "Ubah File" : "Pilih File"}
                    </button>

                    {buktiBayarFile ? (
                      <button
                        type="button"
                        onClick={() => {
                          setBuktiBayarFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="rounded-2xl border-2 border-gray-300 bg-white px-6 py-3 font-bold text-gray-600 transition hover:bg-gray-50"
                      >
                        Batal
                      </button>
                    ) : null}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handlePaymentFileChange(file);
                    }}
                    className="hidden"
                  />

                  {buktiBayarFile ? (
                    <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4">
                      <p className="text-sm font-semibold text-green-700">
                        ✓ File terpilih
                      </p>
                      <p className="mt-2 break-all text-xs text-green-600">
                        {buktiBayarFile.name}
                      </p>
                      <p className="mt-1 text-xs text-green-600">
                        Ukuran: {(buktiBayarFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-[#E8CDBB] bg-[#FFFBF7] p-4">
                      <p className="text-sm font-semibold text-[#2A1810]">
                        Belum ada file dipilih
                      </p>
                      <p className="mt-2 text-xs text-[#7A5A49]">
                        Format: PNG, JPG, WEBP, atau PDF. Maksimal 5MB.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}